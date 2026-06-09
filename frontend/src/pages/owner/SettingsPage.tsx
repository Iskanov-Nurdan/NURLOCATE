import { useEffect, useState } from "react";
import { createAnimal } from "../../api/animals";
import { getNotificationSettings, updateNotificationSettings } from "../../api/notifications";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import type { NotificationSettings } from "../../types";

export function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [newPet, setNewPet] = useState({ name: "", species: "dog", breed: "" });

  useEffect(() => {
    getNotificationSettings().then(setSettings).catch(() => undefined);
  }, []);

  async function saveSettings() {
    if (!settings) return;
    const updated = await updateNotificationSettings(settings);
    setSettings(updated);
  }

  async function addPet(e: React.FormEvent) {
    e.preventDefault();
    await createAnimal(newPet);
    setNewPet({ name: "", species: "dog", breed: "" });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="mb-4 font-bold">Профиль</h2>
        <div className="space-y-1 text-sm">
          <p>Логин: <strong>{user?.username}</strong></p>
          <p>Email: <strong>{user?.email}</strong></p>
          <p>Роль: <strong>{user?.role}</strong></p>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-bold">Уведомления</h2>
        {settings && (
          <div className="space-y-2 text-sm">
            {(["push_enabled", "email_enabled", "sms_enabled"] as const).map((key) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                />
                {key.replace("_enabled", "").toUpperCase()}
              </label>
            ))}
            <Button className="mt-2" onClick={saveSettings}>Сохранить</Button>
          </div>
        )}
      </Card>

      <Card className="lg:col-span-2">
        <h2 className="mb-4 font-bold">Добавить животное</h2>
        <form className="grid gap-3 md:grid-cols-4" onSubmit={addPet}>
          <Input label="Имя" value={newPet.name} onChange={(e) => setNewPet({ ...newPet, name: e.target.value })} required />
          <Input label="Порода" value={newPet.breed} onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })} />
          <Input label="Вид" value={newPet.species} onChange={(e) => setNewPet({ ...newPet, species: e.target.value })} />
          <Button className="mt-6">Добавить</Button>
        </form>
      </Card>
    </div>
  );
}
