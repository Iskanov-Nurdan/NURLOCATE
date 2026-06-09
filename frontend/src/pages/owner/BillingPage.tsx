import { useEffect, useState } from "react";
import { checkout, listPlans, listSubscriptions, updateSubscription } from "../../api/billing";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { Subscription, SubscriptionPlan } from "../../types";
import { formatPrice } from "../../utils/format";

export function BillingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  async function load() {
    const [p, s] = await Promise.all([listPlans(), listSubscriptions()]);
    setPlans(p);
    setSubs(s);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function handleCheckout(code: string) {
    setLoading(code);
    try {
      const result = await checkout(code);
      if (result.checkout_url.startsWith("http")) {
        window.open(result.checkout_url, "_blank");
      }
      await load();
    } finally {
      setLoading(null);
    }
  }

  async function toggleAutoRenew(sub: Subscription) {
    await updateSubscription(sub.id, !sub.auto_renew);
    await load();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="mb-4 font-bold">Тарифы</h2>
        <div className="grid gap-3">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-card border border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <strong>{plan.name}</strong>
                <span>{formatPrice(plan.price_cents)}/мес</span>
              </div>
              <pre className="mb-3 overflow-auto text-xs text-muted">{JSON.stringify(plan.features, null, 2)}</pre>
              <Button disabled={loading === plan.code} onClick={() => handleCheckout(plan.code)}>
                {loading === plan.code ? "Оформление..." : "Оформить"}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-bold">Мои подписки</h2>
        {subs.length === 0 ? (
          <p className="text-muted">Активных подписок нет</p>
        ) : (
          <div className="space-y-3">
            {subs.map((sub) => (
              <div key={sub.id} className="rounded-card border border-border p-3">
                <strong>{sub.plan.name}</strong>
                <p className="text-sm text-muted">Статус: {sub.status}</p>
                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={sub.auto_renew} onChange={() => toggleAutoRenew(sub)} />
                  Автопродление
                </label>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
