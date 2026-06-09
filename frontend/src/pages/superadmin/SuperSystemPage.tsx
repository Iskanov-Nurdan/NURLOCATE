import { useEffect, useState } from "react";
import { getSystemStatus, listAdminDevices } from "../../api/admin";
import { LiveMap } from "../../components/map/LiveMap";
import { Card } from "../../components/ui/Card";
import { useLiveTracking } from "../../hooks/useLiveTracking";
import type { Device, SystemStatus } from "../../types";

export function SuperSystemPage() {
  const { locations } = useLiveTracking();
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    Promise.all([getSystemStatus(), listAdminDevices()])
      .then(([s, d]) => {
        setSystem(s);
        setDevices(d);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {system &&
          Object.entries(system).slice(0, 4).map(([k, v]) => (
            <Card key={k}>
              <p className="text-xs uppercase text-muted">{k}</p>
              <strong>{String(v)}</strong>
            </Card>
          ))}
      </div>
      <Card>
        <h2 className="mb-3 font-bold">Карта плотности устройств</h2>
        <LiveMap locations={locations} />
      </Card>
      <Card>
        <h2 className="mb-3 font-bold">Fleet ({devices.length})</h2>
        <p className="text-sm text-muted">Онлайн: {devices.filter((d) => d.status === "active").length} · Оффлайн: {devices.filter((d) => d.status === "offline").length}</p>
      </Card>
    </div>
  );
}
