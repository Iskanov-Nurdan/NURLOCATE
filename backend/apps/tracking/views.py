from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, response
from rest_framework.views import APIView

from apps.devices.models import Device

from .models import Location
from .serializers import LocationSerializer
from .tasks import process_location_update_task, process_location_update_task_low_priority


class LiveLocationsView(APIView):
    def get(self, request):
        if request.user.is_staff:
            devices = Device.objects.all()
        else:
            devices = Device.objects.filter(assignments__animal__owner=request.user, assignments__is_active=True)
        latest = []
        for device in devices.distinct():
            location = device.locations.first()
            if location:
                latest.append(location)
        return response.Response(LocationSerializer(latest, many=True).data)


class AnimalHistoryView(APIView):
    def get(self, request, animal_id):
        from apps.billing.services import device_history_cutoff
        from apps.devices.models import DeviceAssignment

        qs = Location.objects.filter(
            device__assignments__animal_id=animal_id,
            device__assignments__is_active=True,
        )
        if not request.user.is_staff:
            qs = qs.filter(device__assignments__animal__owner=request.user)
            assignment = DeviceAssignment.objects.filter(animal_id=animal_id, is_active=True).select_related("device").first()
            if assignment:
                qs = qs.filter(recorded_at__gte=device_history_cutoff(assignment.device))
            else:
                qs = qs.none()

        date_from = request.query_params.get("from")
        date_to = request.query_params.get("to")
        if date_from:
            qs = qs.filter(recorded_at__gte=date_from)
        if date_to:
            qs = qs.filter(recorded_at__lte=date_to)
        return response.Response(LocationSerializer(qs[:500], many=True).data)


class AnimalRouteView(AnimalHistoryView):
    pass


class IoTLocationView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_throttles(self):
        from .throttles import IoTRateThrottle
        return [IoTRateThrottle()]

    def post(self, request):
        from .serializers import IoTLocationSerializer
        from .security import check_and_store_nonce, verify_device_signature

        serializer = IoTLocationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            device = Device.objects.get(serial_number=data["device_id"])
        except Device.DoesNotExist:
            return response.Response({"detail": "Device not found."}, status=404)

        if device.status == Device.Status.BLOCKED:
            return response.Response({"detail": "Device blocked."}, status=403)

        nonce = data.get("nonce", "")
        if nonce and not check_and_store_nonce(data["device_id"], nonce):
            return response.Response({"detail": "Replay detected: nonce already used."}, status=403)

        if not verify_device_signature(device.device_token_hash, data, data.get("signature", "")):
            return response.Response({"detail": "Invalid signature."}, status=403)

        location = Location.objects.create(
            device=device,
            lat=data["lat"],
            lng=data["lng"],
            accuracy=data.get("accuracy"),
            speed=data.get("speed"),
            altitude=data.get("altitude"),
            battery_level=data["battery"],
            signal=data.get("signal"),
            mode=data.get("mode", "normal"),
            recorded_at=data["timestamp"],
        )
        device.battery_level = data["battery"]
        device.signal = data.get("signal")
        
        # Only update device mode if sent, preserving backend SOS/WALK target mode
        sent_mode = data.get("mode")
        if sent_mode:
            if device.mode not in (Device.Mode.SOS, Device.Mode.WALK) or sent_mode in (Device.Mode.SOS, Device.Mode.WALK):
                device.mode = sent_mode

        device.firmware_version = data.get("firmware", device.firmware_version)
        device.last_seen_at = timezone.now()
        device.status = Device.Status.ACTIVE
        device.save(update_fields=["battery_level", "signal", "mode", "firmware_version", "last_seen_at", "status"])

        transaction.on_commit(lambda: process_location_update_task.delay(str(location.id)))

        res_data = LocationSerializer(location).data
        res_data["target_mode"] = device.mode
        return response.Response(res_data, status=201)


class IoTBatchLocationView(APIView):
    """
    Приём оффлайн-буфера от ошейника.

    Устройство накапливает GPS-точки в Flash-памяти когда нет GSM,
    и отправляет их батчем при восстановлении связи.

    POST /iot/locations/batch/
    {
        "device_id": "COLLAR-001",
        "nonce": "...",
        "signature": "...",
        "firmware": "1.2.3",
        "points": [
            {"timestamp": "...", "lat": 42.1, "lng": 74.5, "battery": 80, ...},
            ...
        ]
    }
    """
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_throttles(self):
        from .throttles import IoTRateThrottle
        return [IoTRateThrottle()]

    def post(self, request):
        from .serializers import IoTBatchSerializer
        from .security import check_and_store_nonce, verify_device_signature

        serializer = IoTBatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            device = Device.objects.get(serial_number=data["device_id"])
        except Device.DoesNotExist:
            return response.Response({"detail": "Device not found."}, status=404)

        if device.status == Device.Status.BLOCKED:
            return response.Response({"detail": "Device blocked."}, status=403)

        nonce = data.get("nonce", "")
        if nonce and not check_and_store_nonce(data["device_id"], nonce):
            return response.Response({"detail": "Replay detected: nonce already used."}, status=403)

        if not verify_device_signature(device.device_token_hash, data, data.get("signature", "")):
            return response.Response({"detail": "Invalid signature."}, status=403)

        # Сортируем по времени чтобы oldest first
        points = sorted(data["points"], key=lambda p: p["timestamp"])

        accepted = 0
        duplicate = 0
        last_location = None

        with transaction.atomic():
            # Получаем уже существующие timestamp'ы одним запросом
            timestamps = [p["timestamp"] for p in points]
            existing_ts = set(
                Location.objects.filter(device=device, recorded_at__in=timestamps)
                .values_list("recorded_at", flat=True)
            )

            locations_to_create = []
            for point in points:
                if point["timestamp"] in existing_ts:
                    duplicate += 1
                    continue
                locations_to_create.append(Location(
                    device=device,
                    lat=point["lat"],
                    lng=point["lng"],
                    accuracy=point.get("accuracy"),
                    speed=point.get("speed"),
                    altitude=point.get("altitude"),
                    battery_level=point["battery"],
                    signal=point.get("signal"),
                    mode=point.get("mode", "normal"),
                    recorded_at=point["timestamp"],
                ))

            if locations_to_create:
                created = Location.objects.bulk_create(locations_to_create)
                accepted = len(created)
                last_location = created[-1]  # самая последняя точка

        # Обновляем состояние устройства по самой свежей точке
        if last_location:
            most_recent_point = points[-len(locations_to_create)] if locations_to_create else None
            if most_recent_point is None and points:
                most_recent_point = points[-1]

            device.battery_level = last_location.battery_level
            device.signal = last_location.signal
            device.last_seen_at = timezone.now()
            device.status = Device.Status.ACTIVE
            if last_location.mode:
                device.mode = last_location.mode
            if data.get("firmware"):
                device.firmware_version = data["firmware"]
            device.save(update_fields=[
                "battery_level", "signal", "mode",
                "firmware_version", "last_seen_at", "status",
            ])

            # Полный pipeline только для последней точки (геозоны, AI, алерты)
            # Остальные — только realtime publish без спама уведомлений
            location_ids = [str(loc.id) for loc in created[:-1]] if accepted > 1 else []
            last_id = str(last_location.id)

            def schedule_tasks():
                for loc_id in location_ids:
                    process_location_update_task_low_priority.delay(loc_id)
                process_location_update_task.delay(last_id)

            transaction.on_commit(schedule_tasks)

        return response.Response({
            "accepted": accepted,
            "duplicate": duplicate,
            "total": len(points),
        }, status=201)
