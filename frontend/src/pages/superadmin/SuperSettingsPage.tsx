import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function SuperSettingsPage() {
  return (
    <Card>
      <h2 className="mb-4 font-bold">Глобальные настройки</h2>
      <div className="grid max-w-xl gap-3">
        <Input label="Название платформы" defaultValue="PetTrack OS" />
        <Input label="Grace period (дней)" type="number" defaultValue="7" />
        <Input label="IoT rate limit (req/min)" type="number" defaultValue="60" />
        <Input label="WebSocket URL" defaultValue={import.meta.env.VITE_WS_URL ?? "wss://api.pettrack.example/ws/tracking/"} />
        <Button>Сохранить (staging)</Button>
      </div>
      <p className="mt-4 text-sm text-muted">
        Глобальные системные настройки сохраняются в конфигурации окружения до появления dedicated settings API.
      </p>
    </Card>
  );
}
