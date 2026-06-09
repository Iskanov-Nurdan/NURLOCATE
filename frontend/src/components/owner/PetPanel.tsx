import { BatteryMedium, Gauge, MapPin, Signal, Siren } from "lucide-react";
import type { Animal, Device, Location } from "../../types";
import { formatRelativeTime } from "../../utils/format";
import { Button } from "../ui/Button";

type Props = {
  animal: Animal | null;
  device: Device | null;
  location: Location | null;
  onSos: () => void;
  sosLoading?: boolean;
};

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="grid min-h-[72px] grid-cols-[auto_1fr] gap-x-2 gap-y-1 rounded-card border border-border bg-[#0d131b] p-3">
      <span className="text-accent">{icon}</span>
      <span className="text-xs text-muted">{label}</span>
      <strong className="col-span-2 text-lg">{value}</strong>
    </div>
  );
}

export function PetPanel({ animal, device, location, onSos, sosLoading }: Props) {
  if (!animal) {
    return (
      <article className="rounded-card border border-border bg-[#0a0e14]/90 p-4 text-muted backdrop-blur">
        Выберите питомца на карте или в списке
      </article>
    );
  }

  const status = location?.online ? "online" : device?.status === "offline" ? "offline" : "warning";

  return (
    <article className="rounded-card border border-border bg-[#0a0e14]/90 p-4 backdrop-blur">
      <div className="mb-4 flex items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">{animal.name}</h2>
          <p className="text-sm text-muted">{animal.breed || animal.species}</p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${
            status === "online" ? "bg-mint text-[#08110d]" : status === "warning" ? "bg-amber text-[#08110d]" : "bg-[#697480] text-white"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <Metric icon={<BatteryMedium size={18} />} label="Battery" value={`${location?.battery_level ?? device?.battery_level ?? 0}%`} />
        <Metric icon={<Gauge size={18} />} label="Speed" value={`${location?.speed ?? 0} m/s`} />
        <Metric icon={<Signal size={18} />} label="Mode" value={device?.mode ?? location?.mode ?? "normal"} />
        <Metric icon={<MapPin size={18} />} label="Updated" value={formatRelativeTime(location?.recorded_at ?? device?.last_seen_at ?? null)} />
      </div>

      {location && (
        <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted">
          <span>Lat {location.lat}</span>
          <span>Lng {location.lng}</span>
        </div>
      )}

      <Button variant="danger" className="w-full" onClick={onSos} disabled={!device || sosLoading}>
        <Siren size={18} />
        SOS Search
      </Button>
    </article>
  );
}
