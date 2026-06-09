from apps.billing.services import notifications_critical_only

from .models import Notification


def create_notification(user, title: str, body: str, level: str = "info") -> Notification | None:
    if notifications_critical_only(user) and level not in ("critical", "warning"):
        return None
    return Notification.objects.create(user=user, title=title, body=body, level=level)


def notify_geofence_event(user, event) -> Notification | None:
    level = "critical" if event.geofence.is_danger_zone and event.event_type == "exit" else "warning"
    title = f"Геозона: {event.geofence.name}"
    body = f"{event.device.serial_number} — {event.event_type} ({event.geofence.name})"
    return create_notification(user, title, body, level)


def notify_low_battery(user, device) -> Notification | None:
    return create_notification(
        user,
        "Низкий заряд",
        f"{device.serial_number}: заряд {device.battery_level}%",
        "warning",
    )


def notify_device_offline(user, device) -> Notification | None:
    return create_notification(
        user,
        "Устройство оффлайн",
        f"{device.serial_number} потерял связь",
        "critical",
    )


def notify_ai_anomaly(user, animal_name: str, summary: str) -> Notification | None:
    return create_notification(user, f"AI: {animal_name}", summary, "info")
