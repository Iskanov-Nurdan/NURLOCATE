import {
  Bot,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Dog,
  MapPin,
  RefreshCw,
  Shield,
  X,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { checkout, listInvoices, listPlans, listSubscriptions, updateSubscription } from "../../api/billing";
import { listDevices } from "../../api/devices";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { Select } from "../../components/ui/Select";
import type { Device, Invoice, Subscription, SubscriptionPlan } from "../../types";
import { formatPrice } from "../../utils/format";

const FEATURE_META: Record<string, { label: string; icon: React.ElementType; format?: (v: unknown) => string }> = {
  ai:            { label: "AI-аналитика",        icon: Bot },
  sos:           { label: "SOS-режим",            icon: Zap },
  animals:       { label: "Питомцев",             icon: Dog,     format: (v) => `до ${v}` },
  geofences:     { label: "Геозон",               icon: MapPin,  format: (v) => `до ${v}` },
  history_hours: { label: "История",              icon: Clock,   format: (v) => `${v} часов` },
  history_days:  { label: "История",              icon: Clock,   format: (v) => `${v} дней` }
};

function FeatureRow({ k, v }: { k: string; v: unknown }) {
  const meta = FEATURE_META[k];
  if (!meta) return null;
  const Icon = meta.icon;
  const isBool = typeof v === "boolean";

  return (
    <div className="flex items-center gap-2.5 text-sm">
      {isBool ? (
        v ? (
          <CheckCircle2 size={14} className="shrink-0 text-mint" />
        ) : (
          <X size={14} className="shrink-0 text-muted/40" />
        )
      ) : (
        <Icon size={14} className="shrink-0 text-accent" />
      )}
      <span className={isBool && !v ? "text-muted/50 line-through" : "text-text/80"}>
        {meta.format ? meta.format(v) : meta.label}
        {!isBool && <span className="text-muted"> {meta.label.toLowerCase()}</span>}
        {isBool && ` ${meta.label}`}
      </span>
    </div>
  );
}

const PLAN_COLORS: Record<string, string> = {
  free:    "border-border",
  premium: "border-accent/40 shadow-[0_0_20px_rgba(220,38,38,0.08)]",
  family:  "border-mint/30 shadow-[0_0_20px_rgba(22,163,74,0.08)]"
};
const PLAN_BADGE: Record<string, JSX.Element | null> = {
  premium: <Badge variant="info">Популярный</Badge>,
  family:  <Badge variant="success">Макс. защита</Badge>
};

export function BillingPage() {
  const [plans, setPlans]               = useState<SubscriptionPlan[]>([]);
  const [subs, setSubs]                 = useState<Subscription[]>([]);
  const [invoices, setInvoices]         = useState<Invoice[]>([]);
  const [loading, setLoading]           = useState<string | null>(null);
  const [devices, setDevices]           = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  async function load() {
    const [p, s, d, inv] = await Promise.all([listPlans(), listSubscriptions(), listDevices(), listInvoices()]);
    setPlans(p);
    setSubs(s);
    setDevices(d);
    setInvoices(inv);
    if (d.length > 0) setSelectedDeviceId((prev) => prev || d[0].id);
  }

  useEffect(() => { load().catch(() => undefined); }, []);

  async function handleCheckout(code: string) {
    setLoading(code);
    try {
      const result = await checkout(code, selectedDeviceId || undefined);
      if (result.checkout_url.startsWith("http")) window.open(result.checkout_url, "_blank");
      await load();
    } finally {
      setLoading(null);
    }
  }

  async function toggleAutoRenew(sub: Subscription) {
    await updateSubscription(sub.id, !sub.auto_renew);
    await load();
  }

  const activeSub = subs.find((s) => s.status === "active");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">

        {/* Тарифы */}
        <div className="space-y-3">
          <h2 className="font-semibold">Выберите тариф</h2>

          {/* Выбор устройства */}
          {devices.length > 0 ? (
            <div className="flex items-center gap-3">
              <Shield size={14} className="shrink-0 text-muted" />
              <span className="text-sm text-muted whitespace-nowrap">Ошейник:</span>
              <Select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                options={devices.map((d) => ({
                  value: d.id,
                  label: d.serial_number + (d.animal_name ? ` · ${d.animal_name}` : ""),
                }))}
                className="flex-1"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-card border border-amber/25 bg-amber/8 px-4 py-3 text-sm text-amber">
              <Dog size={14} className="shrink-0" />
              Нет привязанных ошейников — подписка оформится без устройства
            </div>
          )}

          {/* Карточки тарифов */}
          <div className="grid gap-3">
            {plans.map((plan) => {
              const colorClass = PLAN_COLORS[plan.code] ?? PLAN_COLORS.free;
              const badge = PLAN_BADGE[plan.code] ?? null;
              const isCurrent = activeSub?.plan.id === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`rounded-card border bg-panel p-5 transition-all ${colorClass} ${isCurrent ? "ring-1 ring-mint/30" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{plan.name}</h3>
                        {badge}
                        {isCurrent && <Badge variant="success">Текущий</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-muted capitalize">{plan.billing_interval === "month" ? "в месяц" : plan.billing_interval}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatPrice(plan.price_cents)}</p>
                      <p className="text-xs text-muted">/мес</p>
                    </div>
                  </div>

                  <div className="my-4 grid grid-cols-2 gap-y-2 gap-x-4">
                    {Object.entries(plan.features).map(([k, v]) => (
                      <FeatureRow key={k} k={k} v={v} />
                    ))}
                  </div>

                  <Button
                    className="w-full"
                    variant={isCurrent ? "secondary" : "primary"}
                    loading={loading === plan.code}
                    disabled={isCurrent}
                    onClick={() => handleCheckout(plan.code)}
                  >
                    {isCurrent ? (
                      <><Check size={15} /> Активен</>
                    ) : loading === plan.code ? (
                      "Оформление..."
                    ) : (
                      "Оформить"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Правая панель */}
        <div className="space-y-3">
          {/* Мои подписки */}
          <Card noPadding>
            <CardHeader>
              <div>
                <h2 className="font-semibold">Мои подписки</h2>
                <p className="text-xs text-muted">{subs.length} активных</p>
              </div>
              <CreditCard size={15} className="text-muted" />
            </CardHeader>
            {subs.length === 0 ? (
              <CardBody>
                <EmptyState icon={CreditCard} title="Подписок нет" description="Выберите тариф слева" />
              </CardBody>
            ) : (
              <div className="divide-y divide-border/50">
                {subs.map((sub) => (
                  <div key={sub.id} className="px-5 py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{sub.plan.name}</p>
                      <Badge variant={sub.status === "active" ? "success" : "muted"}>{sub.status}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-mint">{formatPrice(sub.plan.price_cents)}<span className="text-xs text-muted font-normal">/мес</span></p>
                    {sub.ends_at && (
                      <p className="text-xs text-muted flex items-center gap-1">
                        <Clock size={11} />
                        До {new Date(sub.ends_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted select-none">
                      <div
                        className={`relative h-4.5 w-8 rounded-full transition-colors ${sub.auto_renew ? "bg-mint/70" : "bg-slate-300"}`}
                        onClick={() => toggleAutoRenew(sub)}
                      >
                        <span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${sub.auto_renew ? "translate-x-3.5" : "translate-x-0.5"}`} />
                      </div>
                      <RefreshCw size={11} />
                      Автопродление
                    </label>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* История счетов */}
          {invoices.length > 0 && (
            <Card noPadding>
              <CardHeader>
                <div>
                  <h2 className="font-semibold">Счета</h2>
                  <p className="text-xs text-muted">{invoices.length} выставлено</p>
                </div>
              </CardHeader>
              <div className="divide-y divide-border/50 max-h-52 overflow-y-auto">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="font-mono text-xs font-medium">{inv.number}</p>
                      <p className="text-xs text-muted">{new Date(inv.issued_at).toLocaleDateString("ru-RU")}</p>
                    </div>
                    <span className="font-semibold text-accent">{formatPrice(inv.amount_cents)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
