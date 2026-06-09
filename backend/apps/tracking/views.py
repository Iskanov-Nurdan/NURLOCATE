from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, response
from rest_framework.views import APIView

from apps.billing.services import history_cutoff
from apps.devices.models import Device

from .models import Location
from .serializers import LocationSerializer
from .tasks import process_location_update_task


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
        qs = Location.objects.filter(
            device__assignments__animal_id=animal_id,
            device__assignments__is_active=True,
        )
        if not request.user.is_staff:
            qs = qs.filter(device__assignments__animal__owner=request.user)
            qs = qs.filter(recorded_at__gte=history_cutoff(request.user))

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

    def post(self, request):
        from .serializers import IoTLocationSerializer
        from .security import verify_device_signature

        serializer = IoTLocationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        device = Device.objects.get(serial_number=data["device_id"])

        if device.status == Device.Status.BLOCKED:
            return response.Response({"detail": "Device blocked."}, status=403)

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
        device.mode = data.get("mode", device.mode)
        device.firmware_version = data.get("firmware", device.firmware_version)
        device.last_seen_at = timezone.now()
        device.status = Device.Status.ACTIVE
        device.save(update_fields=["battery_level", "signal", "mode", "firmware_version", "last_seen_at", "status"])

        transaction.on_commit(lambda: process_location_update_task.delay(str(location.id)))

        return response.Response(LocationSerializer(location).data, status=201)
