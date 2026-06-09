import { useEffect, useState } from "react";
import { getAnalyticsOverview } from "../../api/admin";
import { Card } from "../../components/ui/Card";
import type { AnalyticsOverview } from "../../types";
import { formatPrice } from "../../utils/format";

export function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    getAnalyticsOverview().then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <p className="text-muted">Загрузка аналитики...</p>;

  const widgets = [
    { label: "Активные устройства", value: data.active_devices },
    { label: "Оффлайн", value: data.offline_devices },
    { label: "Пользователи", value: data.users },
    { label: "Подписки", value: data.active_subscriptions },
    { label: "MRR", value: formatPrice(data.mrr_cents) },
    { label: "Локаций сегодня", value: data.locations_today }
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {widgets.map((w) => (
          <Card key={w.label}>
            <p className="text-sm text-muted">{w.label}</p>
            <strong className="text-3xl">{w.value}</strong>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="mb-3 font-bold">Устройства по статусу</h2>
        <div className="space-y-2">
          {data.devices_by_status.map((row) => (
            <div key={row.status} className="flex justify-between text-sm">
              <span>{row.status}</span>
              <strong>{row.count}</strong>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
