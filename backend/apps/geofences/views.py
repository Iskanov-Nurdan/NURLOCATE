from rest_framework import decorators, permissions, response, viewsets
from rest_framework.exceptions import PermissionDenied

from apps.billing.services import max_geofences

from .models import Geofence, GeofenceEvent
from .serializers import GeofenceEventSerializer, GeofenceSerializer


class GeofenceViewSet(viewsets.ModelViewSet):
    serializer_class = GeofenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Geofence.objects.all().order_by("name")
        return Geofence.objects.filter(owner=self.request.user).order_by("name")

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            current = Geofence.objects.filter(owner=self.request.user).count()
            if current >= max_geofences(self.request.user):
                raise PermissionDenied(
                    f"Geofence limit reached ({max_geofences(self.request.user)})."
                )
        serializer.save(owner=self.request.user)

    @decorators.action(detail=False, methods=["get"])
    def events(self, request):
        qs = GeofenceEvent.objects.select_related("geofence", "device")
        if not request.user.is_staff:
            qs = qs.filter(geofence__owner=request.user)
        return response.Response(GeofenceEventSerializer(qs[:100], many=True).data)

