import uuid

from django.db import models

from apps.devices.models import Device


class Location(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="locations")
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    accuracy = models.FloatField(null=True, blank=True)
    speed = models.FloatField(null=True, blank=True)
    altitude = models.FloatField(null=True, blank=True)
    battery_level = models.PositiveSmallIntegerField(default=0)
    signal = models.IntegerField(null=True, blank=True)
    mode = models.CharField(max_length=24, blank=True)
    recorded_at = models.DateTimeField(db_index=True)
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-recorded_at"]

