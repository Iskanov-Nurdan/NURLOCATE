import { ClipboardList, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { listAuditLogs } from "../../api/admin";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import type { AuditLog } from "../../types";

const actionVariant = (action: string) => {
  if (action.startsWith("delete") || action.includes("block") || action.includes("revoke")) return "danger";
  if (action.startsWith("create") || action.includes("grant")) return "success";
  if (action.startsWith("update") || action.startsWith("patch")) return "info";
  return "muted";
};

export function SuperAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listAuditLogs()
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        (l.actor_username ?? "").toLowerCase().includes(q) ||
        (l.target_type ?? "").toLowerCase().includes(q)
    );
  }, [logs, query]);

  return (
    <Card noPadding className="animate-fade-in">
      <CardHeader>
        <div>
          <h2 className="font-semibold">Журнал аудита</h2>
          <p className="text-xs text-muted">{logs.length} событий</p>
        </div>
        <label className="flex h-9 w-56 items-center gap-2 rounded-card border border-border bg-surface px-3 text-sm text-muted">
          <Search size={14} />
          <input
            className="min-w-0 flex-1 bg-transparent text-text outline-none placeholder:text-muted/60"
            placeholder="Действие, актор или тип"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </CardHeader>

      {loading ? (
        <CardBody>
          <SkeletonTable rows={10} cols={4} />
        </CardBody>
      ) : filtered.length === 0 ? (
        <CardBody>
          <EmptyState icon={ClipboardList} title="Журнал пуст" description="Аудит-события появятся здесь по мере работы системы" />
        </CardBody>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-medium text-muted">Время</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Актор</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Действие</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Объект</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-border/50 last:border-0 transition-colors hover:bg-white/[0.025]">
                  <td className="px-5 py-3 font-mono text-xs text-muted whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("ru-RU", {
                      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={log.actor_username ?? "system"} size={6} />
                      <span className="font-medium">{log.actor_username ?? <span className="italic text-muted">system</span>}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={actionVariant(log.action)}>{log.action}</Badge>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    <span className="font-medium text-text/70">{log.target_type}</span>
                    {log.target_id && <span className="ml-1 font-mono text-xs text-muted/60">#{log.target_id}</span>}
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
