import { useEffect, useState } from "react";
import { createGeofence, deleteGeofence, listGeofenceEvents, listGeofences } from "../../api/geofences";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import type { Geofence, GeofenceEvent } from "../../types";

export function GeofencesPage() {
  const [zones, setZones] = useState<Geofence[]>([]);
  const [events, setEvents] = useState<GeofenceEvent[]>([]);
  const [form, setForm] = useState({
    name: "",
    center_lat: "42.8746",
    center_lng: "74.5698",
    radius_meters: 200,
    is_danger_zone: false
  });

  async function load() {
    const [z, e] = await Promise.all([listGeofences(), listGeofenceEvents()]);
    setZones(z);
    setEvents(e);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createGeofence(form);
    setForm({ ...form, name: "" });
    await load();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="mb-4 font-bold">Геозоны</h2>
        <div className="space-y-3">
          {zones.map((z) => (
            <div key={z.id} className="flex items-center justify-between rounded-card border border-border p-3">
              <div>
                <strong>{z.name}</strong>
                <p className="text-sm text-muted">
                  {z.is_danger_zone ? "Опасная зона" : "Безопасная"} · {z.radius_meters} м
                </p>
              </div>
              <Button variant="ghost" onClick={() => deleteGeofence(z.id).then(load)}>Удалить</Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-bold">Создать геозону</h2>
        <form className="space-y-3" onSubmit={handleCreate}>
          <Input label="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Lat" value={form.center_lat} onChange={(e) => setForm({ ...form, center_lat: e.target.value })} />
          <Input label="Lng" value={form.center_lng} onChange={(e) => setForm({ ...form, center_lng: e.target.value })} />
          <Input label="Радиус (м)" type="number" value={form.radius_meters} onChange={(e) => setForm({ ...form, radius_meters: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_danger_zone} onChange={(e) => setForm({ ...form, is_danger_zone: e.target.checked })} />
            Опасная зона
          </label>
          <Button>Создать</Button>
        </form>
      </Card>

      <Card className="lg:col-span-2">
        <h2 className="mb-3 font-bold">История событий</h2>
        {events.length === 0 ? (
          <p className="text-sm text-muted">Событий пока нет</p>
        ) : (
          <div className="space-y-2">
            {events.map((e) => (
              <div key={e.id} className="rounded-card bg-white/5 p-2 text-sm">
                {e.device_serial} — {e.event_type} «{e.geofence_name}» · {new Date(e.created_at).toLocaleString("ru")}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
