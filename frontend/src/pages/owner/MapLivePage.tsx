import { AlertTriangle, Bot, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAnimalAIReport } from "../../api/ai";
import { listAnimals } from "../../api/animals";
import { listSubscriptions } from "../../api/billing";
import { listDevices, triggerSos } from "../../api/devices";
import { listGeofenceEvents, listGeofences } from "../../api/geofences";
import { LiveMap } from "../../components/map/LiveMap";
import { PetPanel } from "../../components/owner/PetPanel";
import { Avatar } from "../../components/ui/Avatar";
import { BatteryBar } from "../../components/ui/BatteryBar";
import { useLiveTracking } from "../../hooks/useLiveTracking";
import type { Animal, Device } from "../../types";

export function MapLivePage() {
  const { locations, loading, realtimeMode } = useLiveTracking();
  const [animals, setAnimals]   = useState<Animal[]>([]);
  const [devices, setDevices]   = useState<Device[]>([]);
  const [geofences, setGeofences] = useState<Awaited<ReturnType<typeof listGeofences>>>([]);
  const [events, setEvents]     = useState<Awaited<ReturnType<typeof listGeofenceEvents>>>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activity, setActivity] = useState<{ dailyScore: number; summary: string } | null>(null);
  const [sosLoading, setSosLoading] = useState(false);

  useEffect(() => {
    Promise.all([listAnimals(), listDevices(), listGeofences(), listGeofenceEvents(), listSubscriptions()])
      .then(([a, d, g, ev]) => {
        setAnimals(a);
        setDevices(d);
        setGeofences(g);
        setEvents(ev);
        if (!selectedId && a[0]) setSelectedId(a[0].id);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    getAnimalAIReport(selectedId)
      .then((r) => setActivity({ dailyScore: r.daily_score, summary: r.summary }))
      .catch(() => setActivity(null));
  }, [selectedId]);

  const selectedAnimal   = animals.find((a) => a.id === selectedId) ?? null;
  const selectedLocation = locations.find((l) => l.animal_id === selectedId) ?? null;
  const selectedDevice   = devices.find((d) => d.animal_id === selectedId) ?? null;

  const mapCenter = useMemo<[number, number] | undefined>(() => {
    if (selectedLocation) return [Number(selectedLocation.lat), Number(selectedLocation.lng)];
    if (locations[0]) return [Number(locations[0].lat), Number(locations[0].lng)];
    return undefined;
  }, [selectedLocation, locations]);

  async function handleSos() {
    if (!selectedDevice) return;
    setSosLoading(true);
    try {
      await triggerSos(selectedDevice.id);
      setDevices(await listDevices());
    } finally {
      setSosLoading(false);
    }
  }

  const lowBattery = devices.filter((d) => d.battery_level < 30);
  const geoAlerts  = events.slice(0, 3);
  const alertCount = lowBattery.length + geoAlerts.length;

  const isRealtime = realtimeMode === "websocket";

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Full-screen map */}
      {loading ? (
        <div className="flex h-full w-full items-center justify-center bg-canvas text-muted">
          <RefreshCw size={20} className="animate-spin mr-2" /> Загрузка карты...
        </div>
      ) : (
        <LiveMap
          locations={locations}
          geofences={geofences}
          selectedAnimalId={selectedId}
          onSelectAnimal={setSelectedId}
          center={mapCenter}
          className="h-full rounded-none border-0"
        />
      )}

      {/* TOP-LEFT: connection status */}
      <div className="absolute left-4 top-4 z-[1000] flex items-center gap-2">
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-md border ${
          isRealtime
            ? "border-mint/30 bg-canvas/70 text-mint"
            : "border-amber/30 bg-canvas/70 text-amber"
        }`}>
          {isRealtime ? <Wifi size={11} /> : <WifiOff size={11} />}
          {isRealtime ? "Live" : "Polling"}
        </div>
        {alertCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-critical/30 bg-canvas/70 px-3 py-1.5 text-xs font-medium text-critical backdrop-blur-md">
            <AlertTriangle size={11} />
            {alertCount} alert{alertCount > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* LEFT PANEL: animal list */}
      <div className="absolute left-4 top-14 z-[1000] flex w-52 flex-col gap-1.5">
        {animals.map((animal) => {
          const loc = locations.find((l) => l.animal_id === animal.id);
          const dev = devices.find((d) => d.animal_id === animal.id);
          const online = loc?.online ?? false;
          const battery = loc?.battery_level ?? dev?.battery_level ?? 0;
          const isSelected = animal.id === selectedId;

          return (
            <button
              key={animal.id}
              onClick={() => setSelectedId(animal.id)}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left backdrop-blur-md transition-all ${
                isSelected
                  ? "border-accent/50 bg-canvas/90 shadow-[0_0_12px_rgba(45,120,255,0.2)]"
                  : "border-border/60 bg-canvas/70 hover:bg-canvas/85"
              }`}
            >
              <Avatar name={animal.name} size={7} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-semibold">{animal.name}</p>
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${online ? "bg-mint animate-pulse" : "bg-muted/50"}`} />
                </div>
                <div className="mt-0.5 w-full">
                  <BatteryBar level={battery} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* RIGHT PANEL: selected pet details */}
      <div className="absolute bottom-6 right-4 z-[1000] w-72">
        <PetPanel
          animal={selectedAnimal}
          device={selectedDevice}
          location={selectedLocation}
          onSos={handleSos}
          sosLoading={sosLoading}
        />

        {/* AI Score */}
        {activity && selectedAnimal && (
          <div className="mt-2 rounded-2xl border border-border bg-canvas/85 px-4 py-3 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Bot size={12} className="text-accent" />
                AI-активность
              </div>
              <span className="text-xl font-bold text-mint">{activity.dailyScore}</span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-muted/80">{activity.summary}</p>
          </div>
        )}
      </div>

      {/* BOTTOM: geofence alerts */}
      {geoAlerts.length > 0 && (
        <div className="absolute bottom-6 left-4 z-[1000] flex flex-col gap-1.5">
          {geoAlerts.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-2 rounded-xl border border-amber/30 bg-canvas/80 px-3 py-2 text-xs backdrop-blur-md"
            >
              <AlertTriangle size={11} className="shrink-0 text-amber" />
              <span>
                <strong>{e.device_serial}</strong>
                {" "}{e.event_type === "enter" ? "вошёл в" : "вышел из"}{" "}
                <strong>«{e.geofence_name}»</strong>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Low battery alerts */}
      {lowBattery.length > 0 && (
        <div className="absolute bottom-6 left-4 z-[1000] mt-1 flex flex-col gap-1" style={{ top: "auto", bottom: `${geoAlerts.length * 44 + 24}px` }}>
          {lowBattery.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-2 rounded-xl border border-critical/30 bg-canvas/80 px-3 py-2 text-xs backdrop-blur-md"
            >
              <span className="text-critical">🔋</span>
              <span><strong>{d.animal_name ?? d.serial_number}</strong> — заряд {d.battery_level}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
