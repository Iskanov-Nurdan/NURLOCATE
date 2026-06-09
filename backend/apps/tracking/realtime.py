import json
import os

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.cache import cache

REDIS_LIVE_PREFIX = "live:device:"


def cache_live_location(device_id: str, payload: dict) -> None:
    cache.set(f"{REDIS_LIVE_PREFIX}{device_id}", payload, timeout=3600)


def get_cached_live_location(device_id: str) -> dict | None:
    return cache.get(f"{REDIS_LIVE_PREFIX}{device_id}")


def build_location_payload(location) -> dict:
    assignment = location.device.assignments.filter(is_active=True).select_related("animal").first()
    from apps.devices.services import is_device_online

    return {
        "type": "location.updated",
        "animal_id": str(assignment.animal_id) if assignment else None,
        "device_id": str(location.device_id),
        "lat": float(location.lat),
        "lng": float(location.lng),
        "battery": location.battery_level,
        "online": is_device_online(location.device),
        "recorded_at": location.recorded_at.isoformat(),
        "device_serial": location.device.serial_number,
        "animal_name": assignment.animal.name if assignment else None,
    }


def publish_location_update(location) -> None:
    payload = build_location_payload(location)
    cache_live_location(str(location.device_id), payload)

    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    assignment = location.device.assignments.filter(is_active=True).select_related("animal").first()
    if assignment:
        async_to_sync(channel_layer.group_send)(
            f"user_{assignment.animal.owner_id}_locations",
            {"type": "tracking.event", "payload": payload},
        )

    async_to_sync(channel_layer.group_send)(
        f"device_{location.device_id}_status",
        {"type": "tracking.event", "payload": {**payload, "type": "device.status"}},
    )
    async_to_sync(channel_layer.group_send)("admin_devices", {"type": "tracking.event", "payload": payload})


def publish_alert(user_id: int, payload: dict) -> None:
    channel_layer = get_channel_layer()
    if not channel_layer:
        return
    async_to_sync(channel_layer.group_send)(
        f"user_{user_id}_alerts",
        {"type": "tracking.event", "payload": {**payload, "type": "alert.created"}},
    )
