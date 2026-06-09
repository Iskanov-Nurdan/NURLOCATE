import { useEffect, useState } from "react";
import { listAuditLogs } from "../../api/admin";
import { Card } from "../../components/ui/Card";
import type { AuditLog } from "../../types";

export function SuperAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    listAuditLogs().then(setLogs).catch(() => setLogs([]));
  }, []);

  return (
    <Card>
      <h2 className="mb-4 font-bold">Audit Logs</h2>
      <div className="space-y-2">
        {logs.length === 0 && <p className="text-muted">Журнал пуст</p>}
        {logs.map((log) => (
          <div key={log.id} className="rounded-card border border-border p-3 text-sm">
            <strong>{log.action}</strong> · {log.actor_username ?? "system"}
            <p className="text-muted">{log.target_type} {log.target_id} · {new Date(log.created_at).toLocaleString("ru")}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
