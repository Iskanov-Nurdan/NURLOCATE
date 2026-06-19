from apps.ai.services import analyze_animal_activity
from apps.billing.services import device_has_ai
from apps.devices.models import Device
from apps.geofences.services import check_geofences_for_device
from apps.notifications.services import (
    notify_ai_anomaly,
    notify_geofence_event,
    notify_low_battery,
)

from .models import Location
from .realtime import publish_alert, publish_location_update


def process_location_update(location_id) -> None:
    location = (
        Location.objects.select_related("device")
        .filter(id=location_id)
        .first()
    )
    if not location:
        return

    device = location.device
    assignment = device.assignments.filter(is_active=True).select_related("animal", "animal__owner").first()
    if not assignment:
        publish_location_update(location)
        return

    owner = assignment.animal.owner
    lat, lng = float(location.lat), float(location.lng)

    publish_location_update(location)

    if device.battery_level <= 20:
        notification = notify_low_battery(owner, device)
        if notification:
            publish_alert(owner.id, {"title": notification.title, "body": notification.body, "level": notification.level})

    for event in check_geofences_for_device(device, lat, lng):
        notification = notify_geofence_event(owner, event)
        if notification:
            publish_alert(owner.id, {"title": notification.title, "body": notification.body, "level": notification.level})

    if device_has_ai(device):
        report = analyze_animal_activity(assignment.animal)
        if report.anomalies:
            notification = notify_ai_anomaly(owner, assignment.animal.name, report.summary)
            if notification:
                publish_alert(owner.id, {"title": notification.title, "body": notification.body, "level": notification.level})


def process_location_update_realtime_only(location_id) -> None:
    """Публикует точку в realtime-канал без запуска уведомлений и AI.
    Используется для исторических точек из оффлайн-буфера."""
    location = (
        Location.objects.select_related("device")
        .filter(id=location_id)
        .first()
    )
    if location:
        publish_location_update(location)


def mark_stale_devices_offline() -> int:
    from datetime import timedelta

    from django.utils import timezone

    from apps.devices.services import offline_threshold_seconds
    from apps.notifications.services import notify_device_offline

    threshold = timezone.now() - timedelta(seconds=offline_threshold_seconds())
    stale = Device.objects.filter(last_seen_at__lt=threshold, status=Device.Status.ACTIVE)
    count = 0
    for device in stale.select_related().iterator():
        device.status = Device.Status.OFFLINE
        device.save(update_fields=["status"])
        count += 1
        assignment = device.assignments.filter(is_active=True).select_related("animal__owner").first()
        if assignment:
            notification = notify_device_offline(assignment.animal.owner, device)
            if notification:
                publish_alert(assignment.animal.owner_id, {
                    "title": notification.title,
                    "body": notification.body,
                    "level": notification.level,
                })
    return count
