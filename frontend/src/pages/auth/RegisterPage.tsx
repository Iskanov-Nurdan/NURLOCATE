import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";

export function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", first_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      await login(form.username, form.password);
      navigate("/app/map");
    } catch {
      setError("Не удалось зарегистрироваться");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 text-2xl font-bold">Регистрация</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Имя" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <Input label="Логин" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Пароль" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <p className="text-sm text-critical">{error}</p>}
          <Button className="w-full" disabled={loading}>{loading ? "Создание..." : "Создать аккаунт"}</Button>
        </form>
        <p className="mt-4 text-sm text-muted">
          Уже есть аккаунт? <Link className="text-accent" to="/login">Войти</Link>
        </p>
      </Card>
    </div>
  );
}
