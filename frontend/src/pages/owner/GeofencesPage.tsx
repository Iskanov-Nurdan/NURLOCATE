import { AlertTriangle, MapPin, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createGeofence, deleteGeofence, listGeofenceEvents, listGeofences } from "../../api/geofences";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import type { Geofence, GeofenceEvent } from "../../types";

export function GeofencesPage() {
  const [zones, setZones] = useState<Geofence[]>([]);
  const [events, setEvents] = useState<GeofenceEvent[]>([]);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
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
    setCreating(true);
    try {
      await createGeofence(form);
      setForm({ name: "", center_lat: "42.8746", center_lng: "74.5698", radius_meters: 200, is_danger_zone: false });
      setShowForm(false);
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteGeofence(id);
      setZones((prev) => prev.filter((z) => z.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  function set<K extends keyof typeof form>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: key === "radius_meters" ? Number(e.target.value) : e.target.value }));
  }

  const eventTypeLabel: Record<string, string> = { enter: "вошёл", exit: "вышел" };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card noPadding>
          <CardHeader>
            <div>
              <h2 className="font-semibold">Геозоны</h2>
              <p className="text-xs text-muted">{zones.length} зон настроено</p>
            </div>
            <Button size="sm" onClick={() => setShowForm((v) => !v)}>
              <PlusCircle size={14} />
              Создать
            </Button>
          </CardHeader>

          {showForm && (
            <div className="border-b border-border bg-surface/60 px-5 py-4">
              <form className="space-y-3" onSubmit={handleCreate}>
                <p className="text-sm font-medium">Новая геозона</p>
                <Input label="Название" value={form.name} onChange={set("name")} placeholder="Дом, Парк..." required />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Широта" value={form.center_lat} onChange={set("center_lat")} />
                  <Input label="Долгота" value={form.center_lng} onChange={set("center_lng")} />
                </div>
                <Input label="Радиус (м)" type="number" value={form.radius_meters} onChange={set("radius_meters")} />
                <label className="flex cursor-pointer items-center gap-3 rounded-card border border-border px-3 py-2.5 text-sm transition-colors hover:border-amber/30">
                  <input
                    type="checkbox"
                    className="accent-amber"
                    checked={form.is_danger_zone}
                    onChange={(e) => setForm((f) => ({ ...f, is_danger_zone: e.target.checked }))}
                  />
                  <AlertTriangle size={14} className="text-amber" />
                  Опасная зона (уведомлять при входе)
                </label>
                <div className="flex gap-2">
                  <Button type="submit" loading={creating}>{creating ? "Создаём..." : "Создать"}</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Отмена</Button>
                </div>
              </form>
            </div>
          )}

          {zones.length === 0 ? (
            <CardBody>
              <EmptyState icon={MapPin} title="Геозон нет" description="Создайте зону, чтобы получать уведомления" />
            </CardBody>
          ) : (
            <div className="divide-y divide-border/50">
              {zones.map((z) => (
                <div key={z.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.025]">
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-card ${z.is_danger_zone ? "bg-critical/15 text-critical" : "bg-mint/15 text-mint"}`}
                  >
                    {z.is_danger_zone ? <AlertTriangle size={16} /> : <MapPin size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{z.name}</p>
                    <p className="text-xs text-muted">
                      {z.radius_meters} м · {Number(z.center_lat).toFixed(4)}, {Number(z.center_lng).toFixed(4)}
                    </p>
                  </div>
                  <Badge variant={z.is_danger_zone ? "danger" : "success"}>
                    {z.is_danger_zone ? "Опасная" : "Безопасная"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={deleting === z.id}
                    onClick={() => handleDelete(z.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card noPadding>
          <CardHeader>
            <div>
              <h2 className="font-semibold">История событий</h2>
              <p className="text-xs text-muted">{events.length} событий</p>
            </div>
          </CardHeader>

          {events.length === 0 ? (
            <CardBody>
              <EmptyState title="Событий нет" description="Когда питомец входит или выходит из зоны — событие отобразится здесь" />
            </CardBody>
          ) : (
            <div className="divide-y divide-border/50 max-h-[420px] overflow-y-auto">
              {events.map((e) => (
                <div key={e.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${e.event_type === "enter" ? "bg-mint" : "bg-amber"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{e.device_serial}</span>
                    <span className="text-muted"> {eventTypeLabel[e.event_type] ?? e.event_type} </span>
                    <span className="text-text/70">«{e.geofence_name}»</span>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {new Date(e.created_at).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
