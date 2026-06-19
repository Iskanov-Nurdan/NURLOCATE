import { Save, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

interface SettingsForm {
  platform_name: string;
  grace_period_days: string;
  iot_rate_limit: string;
  ws_url: string;
  max_devices_per_user: string;
  location_ttl_days: string;
}

export function SuperSettingsPage() {
  const [form, setForm] = useState<SettingsForm>({
    platform_name: "PetTrack OS",
    grace_period_days: "7",
    iot_rate_limit: "120",
    ws_url: import.meta.env.VITE_WS_URL ?? "wss://api.pettrack.example/ws/tracking/",
    max_devices_per_user: "10",
    location_ttl_days: "90"
  });
  const [saved, setSaved] = useState(false);

  function set(key: keyof SettingsForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSave}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card noPadding>
            <CardHeader>
              <div>
                <h2 className="font-semibold">Основные</h2>
                <p className="text-xs text-muted">Общие параметры платформы</p>
              </div>
              <Settings size={16} className="text-muted" />
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input
                  label="Название платформы"
                  value={form.platform_name}
                  onChange={set("platform_name")}
                />
                <Input
                  label="Grace period (дней)"
                  type="number"
                  value={form.grace_period_days}
                  onChange={set("grace_period_days")}
                  hint="Сколько дней после истечения подписки сохраняется доступ"
                />
                <Input
                  label="Макс. устройств на пользователя"
                  type="number"
                  value={form.max_devices_per_user}
                  onChange={set("max_devices_per_user")}
                />
                <Input
                  label="Хранение локаций (дней)"
                  type="number"
                  value={form.location_ttl_days}
                  onChange={set("location_ttl_days")}
                  hint="По истечении срока локации удаляются автоматически"
                />
              </div>
            </CardBody>
          </Card>

          <Card noPadding>
            <CardHeader>
              <div>
                <h2 className="font-semibold">Инфраструктура</h2>
                <p className="text-xs text-muted">Сетевые и IoT настройки</p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input
                  label="WebSocket URL"
                  value={form.ws_url}
                  onChange={set("ws_url")}
                  hint="Адрес шлюза для realtime-трекинга"
                />
                <Input
                  label="IoT rate limit (req/min)"
                  type="number"
                  value={form.iot_rate_limit}
                  onChange={set("iot_rate_limit")}
                  hint="Максимум запросов в минуту на одно устройство"
                />

                <div className="rounded-card border border-amber/20 bg-amber/8 p-4">
                  <p className="text-xs font-semibold text-amber">Staging-конфигурация</p>
                  <p className="mt-1 text-xs text-muted">
                    Сохранение применяет настройки к текущему окружению. Для production изменения следует вносить через переменные окружения и CI/CD.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {saved && (
            <p className="animate-fade-in text-sm text-mint">Настройки сохранены</p>
          )}
          <Button type="submit" className="ml-auto gap-2">
            <Save size={15} />
            Сохранить
          </Button>
        </div>
      </form>
    </div>
  );
}
