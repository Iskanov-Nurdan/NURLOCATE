import { CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { listAdminSubscriptions } from "../../api/admin";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { SkeletonTable } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Avatar } from "../../components/ui/Avatar";
import type { Subscription } from "../../types";
import { formatPrice } from "../../utils/format";

const statusVariant = (s: string) =>
  s === "active" ? "success" : s === "pending" ? "warning" : "muted";

export function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAdminSubscriptions()
      .then(setSubs)
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card noPadding className="animate-fade-in">
      <CardHeader>
        <div>
          <h2 className="font-semibold">Подписки</h2>
          <p className="text-xs text-muted">{subs.length} записей</p>
        </div>
      </CardHeader>

      {loading ? (
        <CardBody>
          <SkeletonTable rows={8} cols={4} />
        </CardBody>
      ) : subs.length === 0 ? (
        <CardBody>
          <EmptyState icon={CreditCard} title="Подписок нет" description="Подписки появятся после первой оплаты" />
        </CardBody>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-5 py-3 text-xs font-medium text-muted">Пользователь</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Тариф</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Цена</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Статус</th>
                <th className="px-5 py-3 text-xs font-medium text-muted">Действует до</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-border/50 last:border-0 transition-colors hover:bg-white/[0.025]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={s.username ?? String(s.user)} size={7} />
                      <span className="font-medium">{s.username ?? `#${s.user}`}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">{s.plan.name}</td>
                  <td className="px-5 py-3.5 font-semibold text-mint">{formatPrice(s.plan.price_cents)}<span className="text-xs text-muted">/мес</span></td>
                  <td className="px-5 py-3.5">
                    <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-muted">
                    {s.ends_at ? new Date(s.ends_at).toLocaleDateString("ru-RU") : "—"}
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
