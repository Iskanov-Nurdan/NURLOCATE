import { useEffect, useState } from "react";
import { listAdminSubscriptions } from "../../api/admin";
import { Card } from "../../components/ui/Card";
import type { Subscription } from "../../types";
import { formatPrice } from "../../utils/format";

export function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);

  useEffect(() => {
    listAdminSubscriptions().then(setSubs).catch(() => setSubs([]));
  }, []);

  return (
    <Card>
      <h2 className="mb-4 font-bold">Активные подписки</h2>
      <div className="space-y-2">
        {subs.map((s) => (
          <div key={s.id} className="rounded-card border border-border p-3 text-sm">
            <strong>{s.username ?? `user #${s.user}`}</strong> — {s.plan.name} ({formatPrice(s.plan.price_cents)})
            <p className="text-muted">Статус: {s.status} · с {new Date(s.starts_at).toLocaleDateString("ru")}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
