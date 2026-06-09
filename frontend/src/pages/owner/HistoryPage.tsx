import { subDays } from "date-fns";
import { useEffect, useState } from "react";
import { listAnimals } from "../../api/animals";
import { getAnimalRoute } from "../../api/tracking";
import { LiveMap } from "../../components/map/LiveMap";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import type { Animal, Location } from "../../types";
import { buildActivityReport } from "../../utils/activity";

type Period = "day" | "week" | "month";

export function HistoryPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [animalId, setAnimalId] = useState("");
  const [period, setPeriod] = useState<Period>("day");
  const [route, setRoute] = useState<Location[]>([]);

  useEffect(() => {
    listAnimals().then((a) => {
      setAnimals(a);
      if (a[0]) setAnimalId(a[0].id);
    });
  }, []);

  useEffect(() => {
    if (!animalId) return;
    const days = period === "day" ? 1 : period === "week" ? 7 : 30;
    const from = subDays(new Date(), days).toISOString();
    getAnimalRoute(animalId, from).then(setRoute).catch(() => setRoute([]));
  }, [animalId, period]);

  const report = buildActivityReport(route);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select
          label="Питомец"
          value={animalId}
          onChange={(e) => setAnimalId(e.target.value)}
          options={animals.map((a) => ({ value: a.id, label: a.name }))}
        />
        <Select
          label="Период"
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          options={[
            { value: "day", label: "День" },
            { value: "week", label: "Неделя" },
            { value: "month", label: "Месяц" }
          ]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <LiveMap locations={route.slice(-1)} route={route} center={route[0] ? [Number(route[0].lat), Number(route[0].lng)] : undefined} />
        <Card>
          <h2 className="mb-3 font-bold">Movement History</h2>
          <div className="space-y-2 text-sm">
            <p>Точек маршрута: <strong>{route.length}</strong></p>
            <p>Дистанция: <strong>{report.distanceKm.toFixed(2)} км</strong></p>
            <p>В движении: <strong>{Math.round(report.movingMinutes)} мин</strong></p>
            <p>Прогулок: <strong>{report.walkCount}</strong></p>
            <p>AI score: <strong className="text-mint">{report.dailyScore}</strong></p>
          </div>
        </Card>
      </div>
    </div>
  );
}
