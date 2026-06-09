from django.utils import timezone
from rest_framework import decorators, permissions, response, status, viewsets
from rest_framework.views import APIView

from apps.animals.models import Animal
from apps.billing.services import user_can_sos

from .models import Device, DeviceAssignment
from .serializers import ClaimDeviceSerializer, DeviceModeSerializer, DeviceSerializer


class DeviceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DeviceSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return Device.objects.all().order_by("serial_number")
        return Device.objects.filter(assignments__animal__owner=self.request.user, assignments__is_active=True)

    @decorators.action(detail=True, methods=["get"])
    def status(self, request, pk=None):
        return response.Response(DeviceSerializer(self.get_object()).data)

    @decorators.action(detail=True, methods=["patch"])
    def mode(self, request, pk=None):
        device = self.get_object()
        serializer = DeviceModeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mode = serializer.validated_data["mode"]
        if mode in (Device.Mode.SOS, Device.Mode.WALK) and not user_can_sos(request.user):
            return response.Response({"detail": "SOS/Walk mode requires Premium plan."}, status=403)
        device.mode = mode
        device.save(update_fields=["mode"])
        return response.Response(DeviceSerializer(device).data)

    @decorators.action(detail=True, methods=["post"])
    def sos(self, request, pk=None):
        if not user_can_sos(request.user):
            return response.Response({"detail": "SOS requires Premium plan."}, status=403)
        device = self.get_object()
        device.mode = Device.Mode.SOS
        device.save(update_fields=["mode"])
        return response.Response(DeviceSerializer(device).data)

    @decorators.action(detail=True, methods=["post"])
    def release(self, request, pk=None):
        device = self.get_object()
        DeviceAssignment.objects.filter(device=device, is_active=True).update(is_active=False, released_at=timezone.now())
        device.status = Device.Status.UNCLAIMED
        device.save(update_fields=["status"])
        return response.Response({"detail": "Device released."})


class ClaimDeviceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ClaimDeviceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        animal = Animal.objects.get(id=serializer.validated_data["animal_id"], owner=request.user)
        device, _ = Device.objects.get_or_create(
            serial_number=serializer.validated_data["serial_number"],
            defaults={"status": Device.Status.ACTIVE},
        )
        if device.status == Device.Status.BLOCKED:
            return response.Response({"detail": "Device is blocked."}, status=status.HTTP_403_FORBIDDEN)
        DeviceAssignment.objects.filter(device=device, is_active=True).update(is_active=False, released_at=timezone.now())
        DeviceAssignment.objects.create(device=device, animal=animal)
        device.status = Device.Status.ACTIVE
        device.save(update_fields=["status"])
        return response.Response(DeviceSerializer(device).data, status=201)

