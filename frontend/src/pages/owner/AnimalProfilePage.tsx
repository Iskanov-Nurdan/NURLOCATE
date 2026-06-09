import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addVaccination, getAnimal, getMedical, updateAnimal } from "../../api/animals";
import { claimDevice, listDevices, releaseDevice } from "../../api/devices";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import type { Animal, Device, Vaccination } from "../../types";

export function AnimalProfilePage() {
  const { id } = useParams();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [serial, setSerial] = useState("");
  const [vacForm, setVacForm] = useState({ name: "", vaccinated_at: "", notes: "" });
  const [saving, setSaving] = useState(false);

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
    await claimDevice(serial, id);
    setSerial("");
    await load();
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

  if (!animal) return <p className="text-muted">Загрузка профиля...</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="mb-4 text-xl font-bold">Профиль животного</h2>
        <form className="space-y-3" onSubmit={saveProfile}>
          <Input label="Имя" value={animal.name} onChange={(e) => setAnimal({ ...animal, name: e.target.value })} />
          <Input label="Фото URL" value={animal.photo_url} onChange={(e) => setAnimal({ ...animal, photo_url: e.target.value })} />
          <Select label="Вид" value={animal.species} onChange={(e) => setAnimal({ ...animal, species: e.target.value })} options={[
            { value: "dog", label: "Собака" },
            { value: "cat", label: "Кошка" },
            { value: "horse", label: "Лошадь" },
            { value: "livestock", label: "Скот" },
            { value: "other", label: "Другое" }
          ]} />
          <Input label="Порода" value={animal.breed} onChange={(e) => setAnimal({ ...animal, breed: e.target.value })} />
          <Input label="Дата рождения" type="date" value={animal.birth_date ?? ""} onChange={(e) => setAnimal({ ...animal, birth_date: e.target.value })} />
          <Input label="Вес (кг)" type="number" value={animal.weight ?? ""} onChange={(e) => setAnimal({ ...animal, weight: Number(e.target.value) })} />
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Медицинские заметки</span>
            <textarea
              className="w-full rounded-card border border-border bg-surface p-3"
              rows={4}
              value={animal.medical_notes}
              onChange={(e) => setAnimal({ ...animal, medical_notes: e.target.value })}
            />
          </label>
          <Button disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</Button>
        </form>
      </Card>

      <div className="space-y-4">
        <Card>
          <h2 className="mb-3 font-bold">Ошейник</h2>
          {linked ? (
            <div className="space-y-2 text-sm">
              <p>Серийный номер: <strong>{linked.serial_number}</strong></p>
              <p>Режим: {linked.mode} · Заряд: {linked.battery_level}%</p>
              <Button variant="secondary" onClick={handleRelease}>Отвязать устройство</Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input label="Serial" value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="COLLAR-8F2A91" />
              <Button className="mt-6" onClick={handleClaim}>Привязать</Button>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-bold">Вакцинации</h2>
          <div className="mb-4 space-y-2">
            {vaccinations.map((v) => (
              <div key={v.id} className="rounded-card bg-white/5 p-2 text-sm">
                <strong>{v.name}</strong> — {v.vaccinated_at}
              </div>
            ))}
          </div>
          <form className="space-y-2" onSubmit={handleAddVaccination}>
            <Input label="Название" value={vacForm.name} onChange={(e) => setVacForm({ ...vacForm, name: e.target.value })} required />
            <Input label="Дата" type="date" value={vacForm.vaccinated_at} onChange={(e) => setVacForm({ ...vacForm, vaccinated_at: e.target.value })} required />
            <Input label="Заметки" value={vacForm.notes} onChange={(e) => setVacForm({ ...vacForm, notes: e.target.value })} />
            <Button variant="secondary">Добавить вакцинацию</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
