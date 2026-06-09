import type { ActivityReport, Location } from "../types";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function buildActivityReport(locations: Location[]): ActivityReport {
  if (locations.length < 2) {
    return {
      dailyScore: 50,
      distanceKm: 0,
      movingMinutes: 0,
      avgSpeed: 0,
      walkCount: 0,
      summary: "Недостаточно данных для AI-анализа. Дождитесь новых координат."
    };
  }

  const sorted = [...locations].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  let distanceKm = 0;
  let movingMinutes = 0;
  let speedSum = 0;
  let speedCount = 0;
  let walkCount = 0;
  let inWalk = false;

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const lat1 = Number(prev.lat);
    const lng1 = Number(prev.lng);
    const lat2 = Number(curr.lat);
    const lng2 = Number(curr.lng);
    distanceKm += haversineKm(lat1, lng1, lat2, lng2);

    const dtMin =
      (new Date(curr.recorded_at).getTime() - new Date(prev.recorded_at).getTime()) / 60000;
    const speed = curr.speed ?? 0;
    if (speed > 0.3) {
      movingMinutes += dtMin;
      speedSum += speed;
      speedCount += 1;
      if (!inWalk) {
        walkCount += 1;
        inWalk = true;
      }
    } else {
      inWalk = false;
    }
  }

  const avgSpeed = speedCount ? speedSum / speedCount : 0;
  const dailyScore = Math.min(100, Math.round(distanceKm * 12 + walkCount * 8 + movingMinutes * 0.4));

  let summary = "Активность в пределах нормы.";
  if (dailyScore < 40) summary = "Животное двигается мало — рекомендуем увеличить прогулки.";
  if (dailyScore > 80) summary = "Высокая активность. Маршрут стабилен несколько дней подряд.";
  if (walkCount === 0) summary = "Прогулки не обнаружены. Проверьте заряд ошейника и связь.";

  return { dailyScore, distanceKm, movingMinutes, avgSpeed, walkCount, summary };
}
