import { Battery, BatteryLow, Gauge, MapPin, Navigation, Siren } from "lucide-react";
import type { Animal, Device, Location } from "../../types";
import { formatRelativeTime } from "../../utils/format";
import { Button } from "../ui/Button";
import { Avatar } from "../ui/Avatar";
import { BatteryBar } from "../ui/BatteryBar";

type Props = {
  animal: Animal | null;
  device: Device | null;
  location: Location | null;
  onSos: () => void;
  sosLoading?: boolean;
};

const modeLabel: Record<string, string> = {
  standby: "Ожидание",
  normal: "Обычный",
  walk: "Прогулка",
  sos: "SOS",
};

const modeColor: Record<string, string> = {
  sos: "text-critical",
  walk: "text-mint",
  normal: "text-muted",
  standby: "text-muted/60",
};

export function PetPanel({ animal, device, location, onSos, sosLoading }: Props) {
  if (!animal) {
    return (
      <div className="rounded-2xl border border-border bg-canvas/80 px-5 py-4 text-sm text-muted backdrop-blur-md">
        <Navigation size={14} className="mr-2 inline text-accent" />
        Выберите питомца на карте
      </div>
    );
  }

  const battery = location?.battery_level ?? device?.battery_level ?? 0;
  const speed = location?.speed ? (Number(location.speed) * 3.6).toFixed(1) : "0.0";
  const mode = device?.mode ?? location?.mode ?? "normal";
  const online = location?.online ?? false;
  const isSos = device?.mode === "sos";

  return (
    <div className={`rounded-2xl border bg-canvas/85 backdrop-blur-md overflow-hidden transition-all ${isSos ? "border-critical/60 shadow-[0_0_24px_rgba(255,90,90,0.25)]" : "border-border"}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60">
        <Avatar name={animal.name} size={9} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{animal.name}</p>
            <span className={`h-2 w-2 rounded-full ${online ? "bg-mint animate-pulse" : "bg-muted/50"}`} />
          </div>
          <p className="text-xs text-muted capitalize">{animal.breed || animal.species}</p>
        </div>
        <span className={`text-xs font-semibold ${modeColor[mode] ?? "text-muted"}`}>
          {modeLabel[mode] ?? mode}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 divide-x divide-border/60">
        <div className="px-3 py-3">
          <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted">
            {battery < 30 ? <BatteryLow size={11} className="text-critical" /> : <Battery size={11} />}
            Заряд
          </div>
          <div className="mb-1">
            <BatteryBar level={battery} />
          </div>
          <p className="text-xs font-semibold">{battery}%</p>
        </div>
        <div className="px-3 py-3">
          <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted">
            <Gauge size={11} />
            Скорость
          </div>
          <p className="text-lg font-bold leading-none">{speed}</p>
          <p className="text-[10px] text-muted">км/ч</p>
        </div>
        <div className="px-3 py-3">
          <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted">
            <MapPin size={11} />
            Обновлено
          </div>
          <p className="text-xs font-semibold leading-snug">
            {formatRelativeTime(location?.recorded_at ?? device?.last_seen_at ?? null)}
          </p>
        </div>
      </div>

      {/* Coordinates */}
      {location && (
        <div className="border-t border-border/60 px-4 py-2 font-mono text-[10px] text-muted/70">
          {Number(location.lat).toFixed(6)}, {Number(location.lng).toFixed(6)}
        </div>
      )}

      {/* SOS */}
      <div className="border-t border-border/60 p-3">
        <Button
          variant={isSos ? "primary" : "danger"}
          className={`w-full gap-2 ${isSos ? "animate-pulse bg-critical/80" : ""}`}
          onClick={onSos}
          disabled={!device}
          loading={sosLoading}
        >
          <Siren size={16} />
          {isSos ? "SOS активен" : "Активировать SOS"}
        </Button>
      </div>
    </div>
  );
}
