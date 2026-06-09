import { useEffect, useState } from "react";
import { getAnalyticsOverview, getSystemStatus } from "../../api/admin";
import { Card } from "../../components/ui/Card";
import type { AnalyticsOverview, SystemStatus } from "../../types";
import { formatPrice } from "../../utils/format";

export function SuperOverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [system, setSystem] = useState<SystemStatus | null>(null);

  useEffect(() => {
    Promise.all([getAnalyticsOverview(), getSystemStatus()])
      .then(([a, s]) => {
        setAnalytics(a);
        setSystem(s);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="mb-3 font-bold">Финансовая аналитика</h2>
        {analytics && (
          <div className="space-y-2 text-sm">
            <p>MRR: <strong>{formatPrice(analytics.mrr_cents)}</strong></p>
            <p>ARR: <strong>{formatPrice(analytics.mrr_cents * 12)}</strong></p>
            <p>Активные подписки: <strong>{analytics.active_subscriptions}</strong></p>
            <p>Пользователи: <strong>{analytics.users}</strong></p>
          </div>
        )}
      </Card>
      <Card>
        <h2 className="mb-3 font-bold">Мониторинг системы</h2>
        {system && (
          <div className="space-y-2 text-sm">
            <p>API: <strong className="text-mint">{system.api}</strong></p>
            <p>WebSocket: <strong>{system.websocket_gateway}</strong></p>
            <p>Celery: <strong>{system.celery}</strong></p>
            <p>Redis: <strong>{system.redis}</strong></p>
            <p>IoT ingestion: <strong>{system.iot_ingestion}</strong></p>
            <p>Активные устройства: <strong>{system.active_devices}</strong></p>
            <p>Всего локаций: <strong>{system.locations_total}</strong></p>
          </div>
        )}
      </Card>
    </div>
  );
}
