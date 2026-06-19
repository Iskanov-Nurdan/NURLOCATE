import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { listNotifications, markNotificationRead } from "../../api/notifications";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { LevelBadge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonTable } from "../../components/ui/Skeleton";
import type { Notification } from "../../types";
import { formatRelativeTime } from "../../utils/format";

const levelBg: Record<string, string> = {
  critical: "border-critical/25 bg-critical/8",
  warning: "border-amber/25 bg-amber/8",
  info: "border-accent/25 bg-accent/8"
};

export function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  async function load() {
    setItems(await listNotifications());
  }

  useEffect(() => {
    load()
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    setMarking(id);
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } finally {
      setMarking(null);
    }
  }

  async function markAll() {
    const unreadItems = items.filter((n) => !n.is_read);
    await Promise.all(unreadItems.map((n) => markNotificationRead(n.id).catch(() => undefined)));
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  const unread = items.filter((n) => !n.is_read).length;

  return (
    <Card noPadding className="animate-fade-in">
      <CardHeader>
        <div>
          <h2 className="font-semibold">Уведомления</h2>
          {unread > 0 && <p className="text-xs text-muted">{unread} непрочитанных</p>}
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" onClick={markAll}>
            <CheckCheck size={14} /> Прочитать все
          </Button>
        )}
      </CardHeader>

      {loading ? (
        <CardBody><SkeletonTable rows={5} cols={1} /></CardBody>
      ) : items.length === 0 ? (
        <CardBody>
          <EmptyState icon={Bell} title="Уведомлений нет" description="Уведомления о событиях с вашими питомцами появятся здесь" />
        </CardBody>
      ) : (
        <div className="divide-y divide-border/50">
          {items.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                !n.is_read
                  ? levelBg[n.level ?? "info"] ?? levelBg.info
                  : "hover:bg-white/[0.02]"
              }`}
            >
              <div className="mt-0.5">
                {n.level && <LevelBadge level={n.level} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${n.is_read ? "text-muted" : "text-text"}`}>{n.title}</p>
                <p className="mt-0.5 text-sm text-muted">{n.body}</p>
                <p className="mt-1.5 text-xs text-muted/60">{formatRelativeTime(n.created_at)}</p>
              </div>
              {!n.is_read && (
                <Button
                  variant="secondary"
                  size="sm"
                  loading={marking === n.id}
                  onClick={() => markRead(n.id)}
                  className="shrink-0"
                >
                  Прочитано
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
