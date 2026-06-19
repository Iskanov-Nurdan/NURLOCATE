import { subDays } from "date-fns";
import { Activity, Clock, Footprints, MapPin, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { listAnimals } from "../../api/animals";
import { getAnimalRoute } from "../../api/tracking";
import { LiveMap } from "../../components/map/LiveMap";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { StatCard } from "../../components/ui/StatCard";
import { SkeletonStats } from "../../components/ui/Skeleton";
import type { Animal, Location } from "../../types";
import { buildActivityReport } from "../../utils/activity";

type Period = "day" | "week" | "month";

const PERIOD_OPTS = [
  { value: "day", label: "Сегодня" },
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" }
];

export function HistoryPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [animalId, setAnimalId] = useState("");
  const [period, setPeriod] = useState<Period>("day");
  const [route, setRoute] = useState<Location[]>([]);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    listAnimals().then((a) => {
      setAnimals(a);
      if (a[0]) setAnimalId(a[0].id);
    });
  }, []);

  useEffect(() => {
    if (!animalId) return;
    setLoadingRoute(true);
    const days = period === "day" ? 1 : period === "week" ? 7 : 30;
    const from = subDays(new Date(), days).toISOString();
    getAnimalRoute(animalId, from)
      .then(setRoute)
      .catch(() => setRoute([]))
      .finally(() => setLoadingRoute(false));
  }, [animalId, period]);

  const report = buildActivityReport(route);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-end gap-3">
        <Select
          label="Питомец"
          value={animalId}
          onChange={(e) => setAnimalId(e.target.value)}
          options={animals.map((a) => ({ value: a.id, label: a.name }))}
        />
        <div className="flex rounded-card border border-border bg-panel overflow-hidden">
          {PERIOD_OPTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value as Period)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === value ? "bg-accent/20 text-accent" : "text-muted hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loadingRoute ? (
        <SkeletonStats count={4} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Точек маршрута" value={route.length.toLocaleString()} icon={MapPin} color="blue" />
          <StatCard label="Дистанция" value={`${report.distanceKm.toFixed(2)} км`} icon={Footprints} color="mint" />
          <StatCard label="В движении" value={`${Math.round(report.movingMinutes)} мин`} icon={Clock} color="amber" />
          <StatCard label="AI-оценка" value={report.dailyScore} icon={Zap} color="purple" sub="активности за период" />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <Card noPadding>
          <LiveMap
            locations={route.slice(-1)}
            route={route}
            center={route[0] ? [Number(route[0].lat), Number(route[0].lng)] : undefined}
          />
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Activity size={15} className="text-muted" />
            <h2 className="font-semibold text-sm">Детали прогулок</h2>
          </div>
          {route.length === 0 ? (
            <p className="text-sm text-muted">Нет данных за выбранный период</p>
          ) : (
            <>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-muted">Прогулок</span>
                  <strong>{report.walkCount}</strong>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-muted">Ср. скорость</span>
                  <strong>{(report.distanceKm / Math.max(report.movingMinutes / 60, 0.1)).toFixed(1)} км/ч</strong>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-3">
                  <span className="text-muted">Активность</span>
                  <strong>{route.length > 0 ? Math.round((report.movingMinutes / (period === "day" ? 1440 : period === "week" ? 10080 : 43200)) * 100) : 0}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">AI-оценка</span>
                  <strong className="text-mint">{report.dailyScore} / 100</strong>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-card border border-border">
                <div className="bg-surface px-3 py-2 text-xs font-medium text-muted">Последние точки</div>
                <div className="max-h-40 overflow-y-auto">
                  {route.slice(-8).reverse().map((loc, i) => (
                    <div key={i} className="flex items-center gap-2 border-t border-border/50 px-3 py-1.5 text-xs">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mint/60" />
                      <span className="font-mono text-muted/80">{Number(loc.lat).toFixed(5)}, {Number(loc.lng).toFixed(5)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
