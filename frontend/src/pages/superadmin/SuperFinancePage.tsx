import { useEffect, useState } from "react";
import { getAnalyticsOverview, listAdminSubscriptions } from "../../api/admin";
import { Card } from "../../components/ui/Card";
import type { AnalyticsOverview, Subscription } from "../../types";
import { formatPrice } from "../../utils/format";

export function SuperFinancePage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);

  useEffect(() => {
    Promise.all([getAnalyticsOverview(), listAdminSubscriptions()])
      .then(([a, s]) => {
        setAnalytics(a);
        setSubs(s);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-muted">MRR</p><strong className="text-2xl">{analytics ? formatPrice(analytics.mrr_cents) : "—"}</strong></Card>
        <Card><p className="text-muted">ARR</p><strong className="text-2xl">{analytics ? formatPrice(analytics.mrr_cents * 12) : "—"}</strong></Card>
        <Card><p className="text-muted">Подписки</p><strong className="text-2xl">{analytics?.active_subscriptions ?? "—"}</strong></Card>
      </div>
      <Card>
        <h2 className="mb-3 font-bold">Платежи и подписки</h2>
        {subs.map((s) => (
          <div key={s.id} className="border-t border-border py-2 text-sm first:border-0">
            {s.username} — {s.plan.name} · {s.status}
          </div>
        ))}
      </Card>
    </div>
  );
}
