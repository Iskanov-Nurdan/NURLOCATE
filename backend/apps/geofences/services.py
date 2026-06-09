from math import atan2, cos, radians, sin, sqrt

from .models import DeviceGeofenceState, Geofence, GeofenceEvent


def _distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lng / 2) ** 2
    return 6371000 * 2 * atan2(sqrt(a), sqrt(1 - a))


def is_inside(geofence: Geofence, lat: float, lng: float) -> bool:
    center_lat = float(geofence.center_lat)
    center_lng = float(geofence.center_lng)
    return _distance_meters(center_lat, center_lng, lat, lng) <= geofence.radius_meters


def check_geofences_for_device(device, lat: float, lng: float) -> list[GeofenceEvent]:
    assignment = device.assignments.filter(is_active=True).select_related("animal").first()
    if not assignment:
        return []

    owner = assignment.animal.owner
    geofences = Geofence.objects.filter(owner=owner, is_active=True)
    events: list[GeofenceEvent] = []

    for geofence in geofences:
        inside = is_inside(geofence, lat, lng)
        state, _ = DeviceGeofenceState.objects.get_or_create(device=device, geofence=geofence)
        if state.is_inside == inside:
            continue

        event_type = GeofenceEvent.EventType.ENTER if inside else GeofenceEvent.EventType.EXIT
        event = GeofenceEvent.objects.create(geofence=geofence, device=device, event_type=event_type)
        state.is_inside = inside
        state.save(update_fields=["is_inside", "updated_at"])
        events.append(event)

    return events
