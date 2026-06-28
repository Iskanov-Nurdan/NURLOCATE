import { LocateFixed } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", first_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      await login(form.username, form.password);
      navigate("/app/map");
    } catch {
      setError("Не удалось создать аккаунт. Проверьте данные.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-white shadow-glow">
            <LocateFixed size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">PetTrack OS</h1>
            <p className="mt-0.5 text-sm text-muted">Создайте аккаунт</p>
          </div>
        </div>

        <div className="rounded-[12px] border border-border bg-panel p-7 shadow-card">
          <p className="mb-6 text-base font-semibold text-text">Регистрация</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Имя" value={form.first_name} onChange={set("first_name")} placeholder="Иван" autoFocus />
              <Input label="Логин" value={form.username} onChange={set("username")} placeholder="ivan99" required />
            </div>
            <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="ivan@email.com" required />
            <Input label="Пароль" type="password" value={form.password} onChange={set("password")} placeholder="минимум 8 символов" required />

            {error && (
              <div className="flex items-center gap-2 rounded-card border border-critical/30 bg-red-50 px-3 py-2.5 text-sm text-critical">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                {error}
              </div>
            )}

            <Button className="w-full" size="lg" loading={loading}>
              {loading ? "Создаём аккаунт..." : "Создать аккаунт"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Уже есть аккаунт?{" "}
            <Link className="font-medium text-accent hover:text-red-700" to="/login">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
