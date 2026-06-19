import { Bell, Check, Dog, Mail, MessageSquare, PlusCircle, Smartphone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { createAnimal, listAnimals } from "../../api/animals";
import { getProfile, updateMe, updateProfile } from "../../api/auth";
import { getNotificationSettings, updateNotificationSettings } from "../../api/notifications";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import type { Animal, NotificationSettings, UserProfile } from "../../types";

const SPECIES_OPTIONS = [
  { value: "dog",       label: "🐕 Собака" },
  { value: "cat",       label: "🐈 Кошка" },
  { value: "horse",     label: "🐴 Лошадь" },
  { value: "livestock", label: "🐄 Скот" },
  { value: "other",     label: "🐾 Другое" },
];

const NOTIF_ITEMS = [
  { key: "push_enabled"  as const, label: "Push-уведомления",  icon: Smartphone },
  { key: "email_enabled" as const, label: "Email-уведомления", icon: Mail },
  { key: "sms_enabled"   as const, label: "SMS-уведомления",   icon: MessageSquare },
];

export function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { setAnimals } = useOutletContext<{ animals: Animal[]; setAnimals: (a: Animal[]) => void }>();

  const [profileForm, setProfileForm] = useState({
    first_name: "", last_name: "", email: "", phone: ""
  });
  const [settings, setSettings]   = useState<NotificationSettings | null>(null);
  const [newPet, setNewPet]       = useState({ name: "", species: "dog", breed: "" });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile,  setSavedProfile]  = useState(false);
  const [savingNotif,   setSavingNotif]   = useState(false);
  const [savedNotif,    setSavedNotif]    = useState(false);
  const [addingPet,     setAddingPet]     = useState(false);
  const [petError,      setPetError]      = useState("");

  useEffect(() => {
    getNotificationSettings().then(setSettings).catch(() => undefined);
    getProfile().then((p: UserProfile) => {
      setProfileForm((f) => ({ ...f, phone: p.phone ?? "" }));
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm((f) => ({
        ...f,
        first_name: user.first_name ?? "",
        last_name:  user.last_name  ?? "",
        email:      user.email      ?? "",
      }));
    }
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await Promise.all([
        updateMe({ first_name: profileForm.first_name, last_name: profileForm.last_name, email: profileForm.email }),
        updateProfile({ phone: profileForm.phone }),
      ]);
      await refreshUser();
      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 2500);
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveNotif() {
    if (!settings) return;
    setSavingNotif(true);
    try {
      const updated = await updateNotificationSettings(settings);
      setSettings(updated);
      setSavedNotif(true);
      setTimeout(() => setSavedNotif(false), 2500);
    } finally {
      setSavingNotif(false);
    }
  }

  async function addPet(e: React.FormEvent) {
    e.preventDefault();
    setPetError("");
    if (!newPet.name.trim()) { setPetError("Введите имя питомца"); return; }
    setAddingPet(true);
    try {
      await createAnimal(newPet);
      setNewPet({ name: "", species: "dog", breed: "" });
      listAnimals().then(setAnimals).catch(() => undefined);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("limit") || msg.includes("Forbidden")) {
        setPetError("Достигнут лимит питомцев по вашему тарифу");
      } else {
        setPetError("Не удалось добавить питомца");
      }
    } finally {
      setAddingPet(false);
    }
  }

  function setPF(key: keyof typeof profileForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setProfileForm((f) => ({ ...f, [key]: e.target.value }));
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Профиль */}
        <Card noPadding>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar name={user?.username ?? "U"} size={9} />
              <div>
                <h2 className="font-semibold">Профиль</h2>
                <p className="text-xs text-muted">
                  @{user?.username} · <span className="capitalize">{user?.role ?? "user"}</span>
                </p>
              </div>
            </div>
            <User size={15} className="text-muted" />
          </CardHeader>
          <CardBody>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Имя"
                  value={profileForm.first_name}
                  onChange={setPF("first_name")}
                  placeholder="Иван"
                />
                <Input
                  label="Фамилия"
                  value={profileForm.last_name}
                  onChange={setPF("last_name")}
                  placeholder="Иванов"
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={setPF("email")}
                placeholder="ivan@example.com"
              />
              <Input
                label="Телефон"
                type="tel"
                value={profileForm.phone}
                onChange={setPF("phone")}
                placeholder="+996 XXX XXX XXX"
              />
              <div className="flex items-center gap-3">
                <Button type="submit" loading={savingProfile}>
                  {savingProfile ? "Сохраняем..." : "Сохранить профиль"}
                </Button>
                {savedProfile && (
                  <span className="flex items-center gap-1 text-sm text-mint animate-fade-in">
                    <Check size={14} /> Сохранено
                  </span>
                )}
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Уведомления */}
        <Card noPadding>
          <CardHeader>
            <div>
              <h2 className="font-semibold">Уведомления</h2>
              <p className="text-xs text-muted">Способы получения оповещений</p>
            </div>
            <Bell size={15} className="text-muted" />
          </CardHeader>
          <CardBody>
            {settings ? (
              <div className="space-y-3">
                {NOTIF_ITEMS.map(({ key, label, icon: Icon }) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center justify-between rounded-card border border-border px-4 py-3 transition-colors hover:border-accent/30"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={15} className="text-muted" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div
                      className={`relative h-5 w-9 rounded-full transition-colors ${settings[key] ? "bg-mint/80" : "bg-slate-300"}`}
                      onClick={() => setSettings({ ...settings, [key]: !settings[key] })}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${settings[key] ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                  </label>
                ))}
                <div className="flex items-center gap-3 pt-1">
                  <Button onClick={saveNotif} loading={savingNotif} variant="secondary">
                    {savingNotif ? "Сохраняем..." : "Сохранить"}
                  </Button>
                  {savedNotif && (
                    <span className="flex items-center gap-1 text-sm text-mint animate-fade-in">
                      <Check size={14} /> Сохранено
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">Загрузка...</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Добавить животное */}
      <Card noPadding>
        <CardHeader>
          <div>
            <h2 className="font-semibold">Добавить питомца</h2>
            <p className="text-xs text-muted">Новый питомец появится в боковой панели</p>
          </div>
          <Dog size={15} className="text-muted" />
        </CardHeader>
        <CardBody>
          <form onSubmit={addPet}>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <Input
                label="Имя"
                value={newPet.name}
                onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                placeholder="Барсик"
                required
                error={petError || undefined}
              />
              <Select
                label="Вид"
                value={newPet.species}
                onChange={(e) => setNewPet({ ...newPet, species: e.target.value })}
                options={SPECIES_OPTIONS}
              />
              <Input
                label="Порода"
                value={newPet.breed}
                onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                placeholder="Дворняжка"
              />
              <Button type="submit" className="mt-6 gap-2" loading={addingPet}>
                <PlusCircle size={15} />
                {addingPet ? "Добавляем..." : "Добавить"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
