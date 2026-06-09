import uuid

from django.conf import settings
from django.db import models

from apps.devices.models import Device


class Geofence(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="geofences")
    name = models.CharField(max_length=120)
    center_lat = models.DecimalField(max_digits=9, decimal_places=6)
    center_lng = models.DecimalField(max_digits=9, decimal_places=6)
    radius_meters = models.PositiveIntegerField(default=150)
    is_danger_zone = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class DeviceGeofenceState(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="geofence_states")
    geofence = models.ForeignKey(Geofence, on_delete=models.CASCADE, related_name="device_states")
    is_inside = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("device", "geofence")


class GeofenceEvent(models.Model):
    class EventType(models.TextChoices):
        ENTER = "enter", "Enter"
        EXIT = "exit", "Exit"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    geofence = models.ForeignKey(Geofence, on_delete=models.CASCADE, related_name="events")
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="geofence_events")
    event_type = models.CharField(max_length=12, choices=EventType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

