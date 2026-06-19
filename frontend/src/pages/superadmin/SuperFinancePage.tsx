import { Check, CreditCard, Receipt, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getAnalyticsOverview, listAdminSubscriptions } from "../../api/admin";
import { listAdminInvoices, listAdminPlans, updateAdminPlan } from "../../api/billing";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { SkeletonStats } from "../../components/ui/Skeleton";
import type { AnalyticsOverview, Invoice, Subscription, SubscriptionPlan } from "../../types";
import { formatPrice } from "../../utils/format";

export function SuperFinancePage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [planPrice, setPlanPrice] = useState<string>("");

  useEffect(() => {
    Promise.all([getAnalyticsOverview(), listAdminSubscriptions(), listAdminPlans(), listAdminInvoices()])
      .then(([a, s, p, inv]) => {
        setAnalytics(a);
        setSubs(s);
        setPlans(p);
        setInvoices(inv);
      })
      .catch(() => undefined);
  }, []);

  async function savePlanPrice(plan: SubscriptionPlan) {
    const cents = Math.round(parseFloat(planPrice) * 100);
    if (isNaN(cents)) return;
    const updated = await updateAdminPlan(plan.id, { price_cents: cents });
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingPlan(null);
  }

  if (!analytics) return <SkeletonStats count={4} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="MRR" value={formatPrice(analytics.mrr_cents)} icon={TrendingUp} color="mint" sub="ежемесячная выручка" />
        <StatCard label="ARR (проекция)" value={formatPrice(analytics.mrr_cents * 12)} icon={CreditCard} color="purple" />
        <StatCard label="Подписки" value={analytics.active_subscriptions} icon={CreditCard} color="blue" sub="активных" />
        <StatCard label="Счетов выставлено" value={invoices.length} icon={Receipt} color="amber" />
      </div>

      <Card noPadding>
        <CardHeader>
          <div>
            <h2 className="font-semibold">Тарифные планы</h2>
            <p className="text-xs text-muted">{plans.length} планов</p>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-medium text-muted">Тариф</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Код</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Цена</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Интервал</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Статус</th>
                <th className="px-5 py-3 text-xs font-medium text-muted" />
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b border-border/50 last:border-0 transition-colors hover:bg-white/[0.025]">
                  <td className="px-5 py-3.5 font-semibold">{plan.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted">{plan.code}</td>
                  <td className="px-5 py-3.5">
                    {editingPlan === plan.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={planPrice}
                        onChange={(e) => setPlanPrice(e.target.value)}
                        className="w-24 rounded-card border border-border bg-surface px-2 py-1.5 text-text outline-none focus:ring-2 focus:ring-accent/25"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-mint">{formatPrice(plan.price_cents)}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-muted capitalize">{plan.billing_interval}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={plan.is_active ? "success" : "muted"}>
                      {plan.is_active ? "Активен" : "Неактивен"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {editingPlan === plan.id ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" onClick={() => savePlanPrice(plan)}>
                          <Check size={13} /> Сохранить
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingPlan(null)}>
                          <X size={13} />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => { setEditingPlan(plan.id); setPlanPrice(String(plan.price_cents / 100)); }}
                      >
                        Изменить цену
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card noPadding>
          <CardHeader>
            <div>
              <h2 className="font-semibold">Активные подписки</h2>
              <p className="text-xs text-muted">{subs.length} всего</p>
            </div>
          </CardHeader>
          <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
            {subs.slice(0, 20).map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={s.username ?? String(s.user)} size={7} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.username ?? `#${s.user}`}</p>
                  <p className="text-xs text-muted">{s.plan.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-mint">{formatPrice(s.plan.price_cents)}</p>
                  <Badge variant={s.status === "active" ? "success" : "muted"}>{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card noPadding>
          <CardHeader>
            <div>
              <h2 className="font-semibold">Счета (Invoices)</h2>
              <p className="text-xs text-muted">{invoices.length} выставлено</p>
            </div>
          </CardHeader>
          <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
            {invoices.slice(0, 20).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-mono text-xs font-medium">{inv.number}</p>
                  <p className="text-xs text-muted">{new Date(inv.issued_at).toLocaleDateString("ru-RU")}</p>
                </div>
                <span className="font-semibold text-accent">{formatPrice(inv.amount_cents)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
