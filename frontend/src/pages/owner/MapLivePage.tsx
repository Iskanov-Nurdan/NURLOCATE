import { useEffect, useMemo, useState } from "react";
import { listAnimals } from "../../api/animals";
import { listDevices, triggerSos } from "../../api/devices";
import { listGeofences } from "../../api/geofences";
import { listSubscriptions } from "../../api/billing";
import { listGeofenceEvents } from "../../api/geofences";
import { LiveMap } from "../../components/map/LiveMap";
import { PetPanel } from "../../components/owner/PetPanel";
import { Card } from "../../components/ui/Card";
import { useLiveTracking } from "../../hooks/useLiveTracking";
import type { Animal, Device } from "../../types";
import { getAnimalAIReport } from "../../api/ai";
import { formatPrice } from "../../utils/format";

export function MapLivePage() {
  const { locations, loading, realtimeMode } = useLiveTracking();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [geofences, setGeofences] = useState<Awaited<ReturnType<typeof listGeofences>>>([]);
  const [events, setEvents] = useState<Awaited<ReturnType<typeof listGeofenceEvents>>>([]);
  const [planPrice, setPlanPrice] = useState("$0");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activity, setActivity] = useState<{ dailyScore: number; summary: string } | null>(null);
  const [sosLoading, setSosLoading] = useState(false);

  useEffect(() => {
    Promise.all([listAnimals(), listDevices(), listGeofences(), listGeofenceEvents(), listSubscriptions()])
      .then(([a, d, g, ev, subs]) => {
        setAnimals(a);
        setDevices(d);
        setGeofences(g);
        setEvents(ev);
        const active = subs.find((s) => s.status === "active");
        setPlanPrice(active ? formatPrice(active.plan.price_cents) : "$0");
        if (!selectedId && a[0]) setSelectedId(a[0].id);
      })
      .catch(() => undefined);
  }, []);

  const selectedAnimal = animals.find((a) => a.id === selectedId) ?? null;
  const selectedLocation = locations.find((l) => l.animal_id === selectedId) ?? null;
  const selectedDevice = devices.find((d) => d.animal_id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) return;
    getAnimalAIReport(selectedId)
      .then((report) => setActivity({ dailyScore: report.daily_score, summary: report.summary }))
      .catch(() => setActivity(null));
  }, [selectedId, locations]);

  const mapCenter = useMemo(() => {
    if (selectedLocation) return [Number(selectedLocation.lat), Number(selectedLocation.lng)] as [number, number];
    if (locations[0]) return [Number(locations[0].lat), Number(locations[0].lng)] as [number, number];
    return undefined;
  }, [selectedLocation, locations]);

  async function handleSos() {
    if (!selectedDevice) return;
    setSosLoading(true);
    try {
      await triggerSos(selectedDevice.id);
      const d = await listDevices();
      setDevices(d);
    } finally {
      setSosLoading(false);
    }
  }

  const alerts = [
    ...events.slice(0, 2).map((e) => `${e.device_serial}: ${e.event_type} ${e.geofence_name}`),
    ...devices.filter((d) => d.battery_level < 40).map((d) => `${d.animal_name}: заряд ${d.battery_level}%`)
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <div className="relative min-h-[620px]">
        {loading ? (
          <div className="flex h-[620px] items-center justify-center rounded-card border border-border text-muted">
            Загрузка карты...
          </div>
        ) : (
          <LiveMap
            locations={locations}
            geofences={geofences}
            selectedAnimalId={selectedId}
            onSelectAnimal={setSelectedId}
            center={mapCenter}
          />
        )}
        <div className="absolute bottom-4 right-4 w-full max-w-md">
          <PetPanel animal={selectedAnimal} device={selectedDevice} location={selectedLocation} onSos={handleSos} sosLoading={sosLoading} />
        </div>
        <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs text-muted">
          Realtime: {realtimeMode}
        </span>
      </div>

      <aside className="flex flex-col gap-4">
        <Card>
          <h2 className="mb-3 font-bold">Fleet status</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-t border-border pt-2"><strong>{devices.length}</strong><span className="text-muted">active collars</span></div>
            <div className="flex justify-between border-t border-border pt-2"><strong>{events.length}</strong><span className="text-muted">geofence alerts</span></div>
            <div className="flex justify-between border-t border-border pt-2"><strong>{planPrice}</strong><span className="text-muted">current plan</span></div>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-bold">Alerts</h2>
          <div className="space-y-2">
            {alerts.length === 0 && <p className="text-sm text-muted">Нет активных алертов</p>}
            {alerts.map((a) => (
              <div key={a} className="rounded-card bg-white/5 p-2 text-sm">{a}</div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-1 font-bold">AI activity</h2>
          <p className="text-sm text-muted">Daily score</p>
          <strong className="text-5xl text-mint">{activity?.dailyScore ?? "—"}</strong>
          <p className="mt-2 text-sm text-muted">{activity?.summary ?? "Загрузка аналитики..."}</p>
        </Card>
      </aside>
    </div>
  );
}
