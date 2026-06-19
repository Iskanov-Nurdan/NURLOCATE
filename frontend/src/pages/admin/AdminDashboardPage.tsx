import { Activity, Cpu, CreditCard, TrendingUp, Users, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { getAnalyticsOverview } from "../../api/admin";
import { Card } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { SkeletonStats } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import type { AnalyticsOverview } from "../../types";
import { formatPrice } from "../../utils/format";

const statusColors: Record<string, string> = {
  active: "bg-mint",
  offline: "bg-muted",
  blocked: "bg-critical",
  unclaimed: "bg-amber"
};

export function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    getAnalyticsOverview().then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <SkeletonStats count={6} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Активные устройства" value={data.active_devices} icon={Wifi} color="mint" sub="онлайн прямо сейчас" />
        <StatCard label="Оффлайн" value={data.offline_devices} icon={WifiOff} color="red" sub="потеряли связь" />
        <StatCard label="Пользователи" value={data.users} icon={Users} color="blue" sub="зарегистрировано" />
        <StatCard label="Активные подписки" value={data.active_subscriptions} icon={CreditCard} color="amber" />
        <StatCard label="MRR" value={formatPrice(data.mrr_cents)} icon={TrendingUp} color="mint" sub="ежемесячная выручка" />
        <StatCard label="Локаций сегодня" value={data.locations_today.toLocaleString()} icon={Activity} color="blue" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Устройства по статусу">
          <div className="space-y-3">
            {data.devices_by_status.map((row) => {
              const total = data.devices_by_status.reduce((s, r) => s + r.count, 0);
              const pct = total ? Math.round((row.count / total) * 100) : 0;
              return (
                <div key={row.status}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${statusColors[row.status] ?? "bg-muted"}`} />
                      <span className="capitalize">{row.status}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <strong>{row.count}</strong>
                      <span className="w-8 text-right text-xs text-muted">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${statusColors[row.status] ?? "bg-muted"} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Быстрые действия">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Пользователи", href: "/admin/users", icon: Users },
              { label: "Устройства", href: "/admin/devices", icon: Cpu },
              { label: "Подписки", href: "/admin/subscriptions", icon: CreditCard },
              { label: "Аналитика", href: "/super-admin/finance", icon: TrendingUp }
            ].map(({ label, href, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-3 text-sm font-medium transition-all hover:border-accent/40 hover:bg-accent/8"
              >
                <Icon size={16} className="text-muted" />
                {label}
              </a>
            ))}
          </div>

          <div className="mt-4 rounded-card border border-mint/20 bg-mint/8 p-4">
            <p className="text-xs font-semibold text-mint">ARR (проекция)</p>
            <p className="mt-1 text-2xl font-bold text-text">{formatPrice(data.mrr_cents * 12)}</p>
            <p className="mt-0.5 text-xs text-muted">при текущем MRR × 12</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
