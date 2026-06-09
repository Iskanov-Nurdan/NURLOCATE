from datetime import timedelta
from math import atan2, cos, radians, sin, sqrt

from django.utils import timezone

from apps.tracking.models import Location

from .models import AIActivityReport


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lng / 2) ** 2
    return 6371 * 2 * atan2(sqrt(a), sqrt(1 - a))


def analyze_animal_activity(animal, hours: int = 24) -> AIActivityReport:
    period_end = timezone.now()
    period_start = period_end - timedelta(hours=hours)

    locations = list(
        Location.objects.filter(
            device__assignments__animal=animal,
            device__assignments__is_active=True,
            recorded_at__gte=period_start,
            recorded_at__lte=period_end,
        ).order_by("recorded_at")
    )

    distance_km = 0.0
    moving_minutes = 0.0
    speed_sum = 0.0
    speed_count = 0
    walk_count = 0
    in_walk = False
    anomalies: list[str] = []

    for i in range(1, len(locations)):
        prev, curr = locations[i - 1], locations[i]
        lat1, lng1 = float(prev.lat), float(prev.lng)
        lat2, lng2 = float(curr.lat), float(curr.lng)
        distance_km += _haversine_km(lat1, lng1, lat2, lng2)
        dt_min = (curr.recorded_at - prev.recorded_at).total_seconds() / 60
        speed = curr.speed or 0
        if speed > 0.3:
            moving_minutes += dt_min
            speed_sum += speed
            speed_count += 1
            if not in_walk:
                walk_count += 1
                in_walk = True
        else:
            in_walk = False

    avg_speed = speed_sum / speed_count if speed_count else 0
    daily_score = min(100, int(distance_km * 12 + walk_count * 8 + moving_minutes * 0.4))

    if daily_score < 40:
        anomalies.append("low_activity")
    if walk_count == 0 and len(locations) > 5:
        anomalies.append("no_walks_detected")
    if avg_speed > 4:
        anomalies.append("unusually_high_speed")

    summary = "Активность в пределах нормы."
    if "low_activity" in anomalies:
        summary = "Животное двигается мало — рекомендуем увеличить прогулки."
    elif daily_score > 80:
        summary = "Высокая активность. Маршрут стабилен."
    elif "no_walks_detected" in anomalies:
        summary = "Прогулки не обнаружены. Проверьте заряд ошейника и связь."

    metrics = {
        "distance_km": round(distance_km, 2),
        "moving_minutes": round(moving_minutes, 1),
        "avg_speed": round(avg_speed, 2),
        "walk_count": walk_count,
        "points": len(locations),
    }

    report = AIActivityReport.objects.filter(animal=animal, period_end__gte=period_start).order_by("-period_end").first()
    if report:
        report.daily_score = daily_score
        report.metrics = metrics
        report.summary = summary
        report.anomalies = anomalies
        report.period_end = period_end
        report.save()
        return report

    return AIActivityReport.objects.create(
        animal=animal,
        period_start=period_start,
        period_end=period_end,
        daily_score=daily_score,
        metrics=metrics,
        summary=summary,
        anomalies=anomalies,
    )
