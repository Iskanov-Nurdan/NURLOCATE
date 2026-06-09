import { useEffect, useState } from "react";
import { blockDevice, listAdminDevices } from "../../api/admin";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { Device } from "../../types";

export function AdminDevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);

  async function load() {
    setDevices(await listAdminDevices());
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  return (
    <Card>
      <h2 className="mb-4 font-bold">Устройства</h2>
      <div className="space-y-2">
        {devices.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-border p-3 text-sm">
            <div>
              <strong>{d.serial_number}</strong>
              <p className="text-muted">{d.animal_name ?? "не привязан"} · {d.status} · {d.battery_level}%</p>
            </div>
            <Button variant="secondary" onClick={() => blockDevice(d.id, d.status !== "blocked").then(load)}>
              {d.status === "blocked" ? "Разблокировать" : "Заблокировать"}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
