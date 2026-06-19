import { Search, ShieldOff, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { blockDevice, listAdminDevices } from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { DeviceStatusBadge } from "../../components/ui/Badge";
import { BatteryBar } from "../../components/ui/BatteryBar";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import type { Device } from "../../types";

const modeLabel: Record<string, string> = {
  standby: "Ожидание",
  normal: "Норм.",
  walk: "Прогулка",
  sos: "SOS"
};
const modeColor: Record<string, string> = {
  sos: "text-critical font-semibold",
  walk: "text-mint",
  normal: "text-muted",
  standby: "text-muted/60"
};

export function AdminDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [blocking, setBlocking] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setDevices(await listAdminDevices());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function toggleBlock(d: Device) {
    setBlocking(d.id);
    try {
      await blockDevice(d.id, d.status !== "blocked");
      await load();
    } finally {
      setBlocking(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return devices;
    return devices.filter(
      (d) => d.serial_number.toLowerCase().includes(q) || (d.animal_name ?? "").toLowerCase().includes(q)
    );
  }, [devices, query]);

  return (
    <Card noPadding className="animate-fade-in">
      <CardHeader>
        <div>
          <h2 className="font-semibold">Устройства</h2>
          <p className="text-xs text-muted">{devices.length} ошейников в системе</p>
        </div>
        <label className="flex h-9 w-56 items-center gap-2 rounded-card border border-border bg-surface px-3 text-sm text-muted">
          <Search size={14} />
          <input
            className="min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-muted/60"
            placeholder="Серийный номер или питомец"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </CardHeader>

      {loading ? (
        <CardBody>
          <SkeletonTable rows={8} cols={5} />
        </CardBody>
      ) : filtered.length === 0 ? (
        <CardBody>
          <EmptyState title="Устройств не найдено" />
        </CardBody>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-medium text-muted">Устройство</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Питомец</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Режим</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Заряд</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Статус</th>
                <th className="px-5 py-3 text-xs font-medium text-muted" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-border/50 last:border-0 transition-colors hover:bg-white/[0.025]">
                  <td className="px-5 py-3.5">
                    <p className="font-mono text-xs font-medium">{d.serial_number}</p>
                    {d.firmware_version && (
                      <p className="text-xs text-muted/60">fw {d.firmware_version}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-muted">{d.animal_name ?? <span className="italic text-muted/50">не привязан</span>}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs ${modeColor[d.mode] ?? "text-muted"}`}>
                      {modeLabel[d.mode] ?? d.mode}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <BatteryBar level={d.battery_level} />
                  </td>
                  <td className="px-5 py-3.5">
                    <DeviceStatusBadge status={d.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={blocking === d.id}
                      onClick={() => toggleBlock(d)}
                    >
                      {d.status === "blocked" ? (
                        <><ShieldCheck size={13} /> Разблок.</>
                      ) : (
                        <><ShieldOff size={13} /> Блок.</>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
