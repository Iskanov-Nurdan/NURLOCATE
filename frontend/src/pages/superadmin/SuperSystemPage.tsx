import { useEffect, useState } from "react";
import { getSystemStatus, listAdminDevices } from "../../api/admin";
import { LiveMap } from "../../components/map/LiveMap";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { useLiveTracking } from "../../hooks/useLiveTracking";
import type { Device, SystemStatus } from "../../types";

const statusLabel: Record<string, string> = {
  api: "REST API",
  websocket_gateway: "WebSocket",
  celery: "Celery",
  redis: "Redis",
  iot_ingestion: "IoT Ingest"
};

const isHealthy = (v: string) =>
  ["ok", "healthy", "running", "active"].includes(String(v).toLowerCase());

export function SuperSystemPage() {
  const { locations } = useLiveTracking();
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    Promise.all([getSystemStatus(), listAdminDevices()])
      .then(([s, d]) => { setSystem(s); setDevices(d); })
      .catch(() => undefined);
  }, []);

  const online = devices.filter((d) => d.status === "active").length;
  const offline = devices.filter((d) => d.status === "offline").length;

  return (
    <div className="space-y-4 animate-fade-in">
      {system && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(["api", "websocket_gateway", "celery", "redis"] as const).map((key) => {
            const val = String((system as Record<string, unknown>)[key] ?? "—");
            const ok = isHealthy(val);
            return (
              <Card key={key}>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted">{statusLabel[key]}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${ok ? "bg-mint animate-pulse" : "bg-critical"}`} />
                  <strong className={ok ? "text-mint" : "text-critical"}>{val}</strong>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card noPadding>
        <CardHeader>
          <div>
            <h2 className="font-semibold">Карта плотности устройств</h2>
            <p className="text-xs text-muted">{locations.length} онлайн-точек · {devices.length} устройств всего</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-mint" />
              <span className="text-muted">онлайн: <strong className="text-text">{online}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-muted" />
              <span className="text-muted">оффлайн: <strong className="text-text">{offline}</strong></span>
            </div>
          </div>
        </CardHeader>
        <LiveMap locations={locations} />
      </Card>
    </div>
  );
}
