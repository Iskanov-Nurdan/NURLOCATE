import {
  Activity,
  CreditCard,
  Database,
  Radio,
  Server,
  TrendingUp,
  Users,
  Wifi,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAnalyticsOverview, getSystemStatus } from "../../api/admin";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { SkeletonStats } from "../../components/ui/Skeleton";
import type { AnalyticsOverview, SystemStatus } from "../../types";
import { formatPrice } from "../../utils/format";

type ServiceKey = keyof Pick<SystemStatus, "api" | "websocket_gateway" | "celery" | "redis" | "iot_ingestion">;

const services: { key: ServiceKey; label: string; icon: React.ElementType }[] = [
  { key: "api", label: "REST API", icon: Server },
  { key: "websocket_gateway", label: "WebSocket", icon: Radio },
  { key: "celery", label: "Celery", icon: Zap },
  { key: "redis", label: "Redis", icon: Database },
  { key: "iot_ingestion", label: "IoT Ingest", icon: Wifi }
];

function ServiceRow({ label, status, icon: Icon }: { label: string; status: string; icon: React.ElementType }) {
  const ok = status === "ok" || status === "healthy" || status === "running";
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3 text-sm">
        <Icon size={14} className="text-muted" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-mint animate-pulse" : "bg-critical"}`} />
        <span className={`text-xs font-medium ${ok ? "text-mint" : "text-critical"}`}>{status}</span>
      </div>
    </div>
  );
}

export function SuperOverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [system, setSystem] = useState<SystemStatus | null>(null);

  useEffect(() => {
    Promise.all([getAnalyticsOverview(), getSystemStatus()])
      .then(([a, s]) => { setAnalytics(a); setSystem(s); })
      .catch(() => undefined);
  }, []);

  if (!analytics) return <SkeletonStats count={4} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="MRR" value={formatPrice(analytics.mrr_cents)} icon={TrendingUp} color="mint" sub="ежемесячная выручка" />
        <StatCard label="ARR (проекция)" value={formatPrice(analytics.mrr_cents * 12)} icon={CreditCard} color="purple" sub="×12 к MRR" />
        <StatCard label="Подписки" value={analytics.active_subscriptions} icon={Activity} color="blue" sub="активных" />
        <StatCard label="Пользователи" value={analytics.users} icon={Users} color="amber" sub="зарегистрировано" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card noPadding>
          <CardHeader>
            <div>
              <h2 className="font-semibold">Мониторинг сервисов</h2>
              <p className="text-xs text-muted">Состояние инфраструктуры</p>
            </div>
          </CardHeader>
          <CardBody>
            {system ? (
              <div>
                {services.map(({ key, label, icon }) => (
                  <ServiceRow key={key} label={label} status={system[key]} icon={icon} />
                ))}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-card border border-border bg-surface p-3">
                    <p className="text-xs text-muted">Активных устройств</p>
                    <p className="mt-0.5 text-xl font-bold">{system.active_devices}</p>
                  </div>
                  <div className="rounded-card border border-border bg-surface p-3">
                    <p className="text-xs text-muted">Локаций в БД</p>
                    <p className="mt-0.5 text-xl font-bold">{system.locations_total?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">Загрузка...</p>
            )}
          </CardBody>
        </Card>

        <Card noPadding>
          <CardHeader>
            <div>
              <h2 className="font-semibold">Финансовый срез</h2>
              <p className="text-xs text-muted">Текущие метрики</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted">MRR</span>
                  <span className="font-semibold text-mint">{formatPrice(analytics.mrr_cents)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-mint/60 to-mint" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted">ARR</span>
                  <span className="font-semibold">{formatPrice(analytics.mrr_cents * 12)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-accent/60 to-accent" />
                </div>
              </div>
              <div className="rounded-card border border-mint/20 bg-mint/8 p-4 mt-2">
                <p className="text-xs font-medium text-mint">Средний чек</p>
                <p className="mt-1 text-2xl font-bold">
                  {analytics.active_subscriptions
                    ? formatPrice(Math.round(analytics.mrr_cents / analytics.active_subscriptions))
                    : "—"}
                </p>
                <p className="mt-0.5 text-xs text-muted">на одну подписку в месяц</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
