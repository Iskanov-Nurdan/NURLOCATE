import uuid

from django.db import models

from apps.animals.models import Animal


class Device(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        OFFLINE = "offline", "Offline"
        BLOCKED = "blocked", "Blocked"
        UNCLAIMED = "unclaimed", "Unclaimed"

    class Mode(models.TextChoices):
        STANDBY = "standby", "Standby"
        NORMAL = "normal", "Normal"
        WALK = "walk", "Walk"
        SOS = "sos", "SOS"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    serial_number = models.CharField(max_length=80, unique=True)
    imei = models.CharField(max_length=40, blank=True)
    sim_iccid = models.CharField(max_length=40, blank=True)
    firmware_version = models.CharField(max_length=32, blank=True)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.UNCLAIMED)
    mode = models.CharField(max_length=24, choices=Mode.choices, default=Mode.NORMAL)
    battery_level = models.PositiveSmallIntegerField(default=100)
    signal = models.IntegerField(null=True, blank=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    device_token_hash = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.serial_number


class DeviceAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name="device_assignments")
    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="assignments")
    is_active = models.BooleanField(default=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    released_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["device"],
                condition=models.Q(is_active=True),
                name="one_active_assignment_per_device",
            )
        ]

