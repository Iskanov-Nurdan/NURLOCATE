from datetime import timedelta

from django.utils import timezone

from .models import Subscription, SubscriptionPlan


def get_active_subscription(user):
    return (
        Subscription.objects.filter(user=user, status="active")
        .select_related("plan")
        .order_by("-starts_at")
        .first()
    )


def get_user_plan(user) -> SubscriptionPlan | None:
    sub = get_active_subscription(user)
    return sub.plan if sub else None


def get_plan_features(user) -> dict:
    plan = get_user_plan(user)
    if plan:
        return plan.features or {}
    return {"animals": 3, "history_hours": 24, "sos": False, "ai": False, "geofences": 3}


def user_has_ai(user) -> bool:
    return bool(get_plan_features(user).get("ai"))


def user_can_sos(user) -> bool:
    return bool(get_plan_features(user).get("sos"))


def max_animals(user) -> int:
    return int(get_plan_features(user).get("animals", 1))


def max_geofences(user) -> int:
    features = get_plan_features(user)
    if "geofences" in features:
        return int(features["geofences"])
    if features.get("sos"):
        return 10
    return 1


def history_cutoff(user):
    features = get_plan_features(user)
    now = timezone.now()
    if days := features.get("history_days"):
        return now - timedelta(days=int(days))
    if hours := features.get("history_hours"):
        return now - timedelta(hours=int(hours))
    return now - timedelta(hours=24)


def notifications_critical_only(user) -> bool:
    return not get_plan_features(user).get("sos", False)


def link_device_subscription(device, subscription):
    from .models import DeviceSubscription

    DeviceSubscription.objects.filter(device=device, is_active=True).update(is_active=False)
    DeviceSubscription.objects.create(device=device, subscription=subscription, is_active=True)


def get_device_active_subscription(device):
    from apps.billing.models import DeviceSubscription
    ds = DeviceSubscription.objects.filter(device=device, is_active=True).select_related("subscription__plan").first()
    if ds and ds.subscription.status == "active":
        return ds.subscription
    return None


def get_device_plan_features(device) -> dict:
    sub = get_device_active_subscription(device)
    if sub:
        return sub.plan.features or {}
    return {"history_hours": 24, "sos": False, "ai": False}


def device_has_ai(device) -> bool:
    return bool(get_device_plan_features(device).get("ai"))


def device_can_sos(device) -> bool:
    return bool(get_device_plan_features(device).get("sos"))


def device_history_cutoff(device):
    features = get_device_plan_features(device)
    now = timezone.now()
    if days := features.get("history_days"):
        return now - timedelta(days=int(days))
    if hours := features.get("history_hours"):
        return now - timedelta(hours=int(hours))
    return now - timedelta(hours=24)

