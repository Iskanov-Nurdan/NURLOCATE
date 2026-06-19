import logging

from django.core.mail import send_mail

from apps.billing.services import notifications_critical_only

from .models import Notification, NotificationSettings

logger = logging.getLogger(__name__)


def _send_email_async(user, title: str, body: str) -> None:
    try:
        settings_obj = NotificationSettings.objects.filter(user=user).first()
        if settings_obj and not settings_obj.email_enabled:
            return
        if not user.email:
            return
        send_mail(
            subject=f"[PetTrack OS] {title}",
            message=body,
            from_email=None,
            recipient_list=[user.email],
            fail_silently=True,
        )
    except Exception:
        logger.exception("Failed to send email to %s", user.email)


def _send_fcm(user, title: str, body: str, data: dict | None = None) -> None:
    try:
        from apps.accounts.models import UserProfile
        from .fcm import send_push
        profile = UserProfile.objects.filter(user=user).first()
        if profile and profile.fcm_token:
            send_push(profile.fcm_token, title, body, data or {})
    except Exception:
        logger.exception("FCM push failed for user %s", user.pk)


def _send_sms_critical(user, title: str, body: str) -> None:
    try:
        from apps.accounts.models import UserProfile
        from .sms import send_sms
        profile = UserProfile.objects.filter(user=user).first()
        phone = profile.phone if profile else ""
        if phone:
            send_sms(phone, f"[PetTrack OS] {title}: {body}")
    except Exception:
        logger.exception("SMS send failed for user %s", user.pk)


def create_notification(user, title: str, body: str, level: str = "info") -> Notification | None:
    if notifications_critical_only(user) and level not in ("critical", "warning"):
        return None
    notification = Notification.objects.create(user=user, title=title, body=body, level=level)
    if level in ("critical", "warning"):
        _send_email_async(user, title, body)
    _send_fcm(user, title, body, {"level": level})
    if level == "critical":
        _send_sms_critical(user, title, body)
    return notification


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
