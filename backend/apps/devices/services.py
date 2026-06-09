from django.conf import settings
from django.utils import timezone


def offline_threshold_seconds() -> int:
    return int(getattr(settings, "DEVICE_OFFLINE_THRESHOLD_SECONDS", 600))


def is_device_online(device) -> bool:
    if device.status == device.Status.BLOCKED:
        return False
    if not device.last_seen_at:
        return device.status == device.Status.ACTIVE
    delta = (timezone.now() - device.last_seen_at).total_seconds()
    return delta <= offline_threshold_seconds()
