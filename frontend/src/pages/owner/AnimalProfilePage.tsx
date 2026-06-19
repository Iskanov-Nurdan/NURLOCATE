import { Activity, Link2, Link2Off, Save, Stethoscope, Syringe } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addVaccination, getAnimal, getMedical, updateAnimal } from "../../api/animals";
import { claimDevice, listDevices, releaseDevice } from "../../api/devices";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { BatteryBar } from "../../components/ui/BatteryBar";
import { DeviceStatusBadge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import type { Animal, Device, Vaccination } from "../../types";

type Tab = "profile" | "device" | "vaccinations";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "profile", label: "Профиль", icon: Activity },
  { key: "device", label: "Ошейник", icon: Link2 },
  { key: "vaccinations", label: "Вакцинации", icon: Syringe }
];

const SPECIES_OPTIONS = [
  { value: "dog", label: "Собака" },
  { value: "cat", label: "Кошка" },
  { value: "horse", label: "Лошадь" },
  { value: "livestock", label: "Скот" },
  { value: "other", label: "Другое" }
];

const SEX_OPTIONS = [
  { value: "male", label: "Самец" },
  { value: "female", label: "Самка" }
];

export function AnimalProfilePage() {
  const { id } = useParams();
  const [tab, setTab] = useState<Tab>("profile");
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [serial, setSerial] = useState("");
  const [vacForm, setVacForm] = useState({ name: "", vaccinated_at: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [claiming, setClaiming] = useState(false);

  async function load() {
    if (!id) return;
    const [a, med, d] = await Promise.all([getAnimal(id), getMedical(id), listDevices()]);
    setAnimal(a);
    setVaccinations(med.vaccinations);
    setDevices(d);
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, [id]);

  const linked = devices.find((d) => d.animal_id === id);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!animal || !id) return;
    setSaving(true);
    try {
      const updated = await updateAnimal(id, {
        name: animal.name,
        breed: animal.breed,
        species: animal.species,
        birth_date: animal.birth_date,
        sex: animal.sex,
        weight: animal.weight,
        medical_notes: animal.medical_notes,
        photo_url: animal.photo_url
      });
      setAnimal(updated);
    } finally {
      setSaving(false);
    }
  }

  async function handleClaim() {
    if (!id || !serial) return;
    setClaiming(true);
    try {
      await claimDevice(serial, id);
      setSerial("");
      await load();
    } finally {
      setClaiming(false);
    }
  }

  async function handleRelease() {
    if (!linked) return;
    await releaseDevice(linked.id);
    await load();
  }

  async function handleAddVaccination(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    await addVaccination(id, vacForm);
    setVacForm({ name: "", vaccinated_at: "", notes: "" });
    const med = await getMedical(id);
    setVaccinations(med.vaccinations);
  }

  if (!animal) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-card bg-panel" />
        <div className="h-64 animate-pulse rounded-card bg-panel" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={animal.name} size={14} />
          <div>
            <h1 className="text-xl font-bold">{animal.name}</h1>
            <p className="text-sm text-muted capitalize">{animal.species} · {animal.breed || "порода не указана"}</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-1 rounded-card border border-border bg-panel p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-[6px] px-4 py-2 text-sm font-medium transition-all ${
              tab === key
                ? "bg-accent/15 text-accent"
                : "text-muted hover:text-text"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <Card noPadding>
          <CardHeader>
            <div>
              <h2 className="font-semibold">Основные данные</h2>
              <p className="text-xs text-muted">Редактируйте профиль питомца</p>
            </div>
          </CardHeader>
          <CardBody>
            <form className="space-y-4" onSubmit={saveProfile}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Имя" value={animal.name} onChange={(e) => setAnimal({ ...animal, name: e.target.value })} required />
                <Input label="Фото URL" value={animal.photo_url ?? ""} onChange={(e) => setAnimal({ ...animal, photo_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select label="Вид" value={animal.species} onChange={(e) => setAnimal({ ...animal, species: e.target.value })} options={SPECIES_OPTIONS} />
                <Select label="Пол" value={animal.sex ?? ""} onChange={(e) => setAnimal({ ...animal, sex: e.target.value })} options={SEX_OPTIONS} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Порода" value={animal.breed ?? ""} onChange={(e) => setAnimal({ ...animal, breed: e.target.value })} />
                <Input label="Дата рождения" type="date" value={animal.birth_date ?? ""} onChange={(e) => setAnimal({ ...animal, birth_date: e.target.value })} />
              </div>
              <Input label="Вес (кг)" type="number" value={animal.weight ?? ""} onChange={(e) => setAnimal({ ...animal, weight: Number(e.target.value) })} />
              <Textarea label="Медицинские заметки" rows={4} value={animal.medical_notes ?? ""} onChange={(e) => setAnimal({ ...animal, medical_notes: e.target.value })} />
              <Button type="submit" loading={saving} className="gap-2">
                <Save size={15} />
                {saving ? "Сохраняем..." : "Сохранить"}
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {tab === "device" && (
        <Card noPadding>
          <CardHeader>
            <div>
              <h2 className="font-semibold">Ошейник</h2>
              <p className="text-xs text-muted">{linked ? "Устройство привязано" : "Устройство не привязано"}</p>
            </div>
            <Link2 size={16} className="text-muted" />
          </CardHeader>
          <CardBody>
            {linked ? (
              <div className="space-y-4">
                <div className="rounded-card border border-border bg-surface p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-mono text-sm font-medium">{linked.serial_number}</p>
                    <DeviceStatusBadge status={linked.status} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">Режим</span>
                      <span className="capitalize">{linked.mode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">Заряд</span>
                      <div className="w-32">
                        <BatteryBar level={linked.battery_level} />
                      </div>
                    </div>
                    {linked.firmware_version && (
                      <div className="flex justify-between">
                        <span className="text-muted">Прошивка</span>
                        <span className="font-mono text-xs">{linked.firmware_version}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="secondary" onClick={handleRelease} className="gap-2">
                  <Link2Off size={14} />
                  Отвязать устройство
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted">Введите серийный номер ошейника, чтобы привязать его к этому питомцу.</p>
                <Input
                  label="Серийный номер"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  placeholder="COLLAR-8F2A91"
                />
                <Button loading={claiming} disabled={!serial} onClick={handleClaim} className="gap-2">
                  <Link2 size={14} />
                  Привязать устройство
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {tab === "vaccinations" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card noPadding>
            <CardHeader>
              <div>
                <h2 className="font-semibold">История вакцинаций</h2>
                <p className="text-xs text-muted">{vaccinations.length} записей</p>
              </div>
              <Stethoscope size={16} className="text-muted" />
            </CardHeader>
            {vaccinations.length === 0 ? (
              <CardBody>
                <p className="text-sm text-muted">Записей о вакцинациях нет. Добавьте первую запись справа.</p>
              </CardBody>
            ) : (
              <div className="divide-y divide-border/50">
                {vaccinations.map((v) => (
                  <div key={v.id} className="flex items-start gap-3 px-5 py-4">
                    <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mint/15 text-mint">
                      <Syringe size={13} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{v.name}</p>
                      <p className="text-xs text-muted">
                        {new Date(v.vaccinated_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      {v.notes && <p className="mt-1 text-xs text-muted/80">{v.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card noPadding>
            <CardHeader>
              <div>
                <h2 className="font-semibold">Добавить запись</h2>
              </div>
            </CardHeader>
            <CardBody>
              <form className="space-y-3" onSubmit={handleAddVaccination}>
                <Input
                  label="Вакцина"
                  value={vacForm.name}
                  onChange={(e) => setVacForm({ ...vacForm, name: e.target.value })}
                  placeholder="Rabies, Distemper..."
                  required
                />
                <Input
                  label="Дата"
                  type="date"
                  value={vacForm.vaccinated_at}
                  onChange={(e) => setVacForm({ ...vacForm, vaccinated_at: e.target.value })}
                  required
                />
                <Input
                  label="Заметки"
                  value={vacForm.notes}
                  onChange={(e) => setVacForm({ ...vacForm, notes: e.target.value })}
                  placeholder="Доза, ветклиника..."
                />
                <Button type="submit" variant="secondary" className="w-full gap-2">
                  <Syringe size={14} />
                  Добавить
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
