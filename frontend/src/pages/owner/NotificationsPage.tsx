import { useEffect, useState } from "react";
import { listNotifications, markNotificationRead } from "../../api/notifications";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { Notification } from "../../types";
import { formatRelativeTime } from "../../utils/format";

export function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  async function load() {
    setItems(await listNotifications());
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  return (
    <Card>
      <h2 className="mb-4 text-xl font-bold">Уведомления</h2>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-muted">Уведомлений нет</p>}
        {items.map((n) => (
          <div key={n.id} className={`rounded-card border p-3 ${n.is_read ? "border-border bg-white/3" : "border-accent/30 bg-accent/10"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <strong>{n.title}</strong>
                <p className="text-sm text-muted">{n.body}</p>
                <p className="mt-1 text-xs text-muted">{formatRelativeTime(n.created_at)}</p>
              </div>
              {!n.is_read && (
                <Button variant="secondary" onClick={() => markNotificationRead(n.id).then(load)}>
                  Прочитано
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
