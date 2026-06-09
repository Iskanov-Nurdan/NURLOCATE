import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(username, password);
      if (user.is_superuser) navigate("/super-admin");
      else if (user.is_staff) navigate("/admin");
      else navigate("/app/map");
    } catch {
      setError("Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-bold">PetTrack OS</h1>
        <p className="mb-6 text-sm text-muted">Вход в панель управления</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Логин" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-critical">{error}</p>}
          <Button className="w-full" disabled={loading}>{loading ? "Вход..." : "Войти"}</Button>
        </form>
        <p className="mt-4 text-sm text-muted">
          Нет аккаунта? <Link className="text-accent" to="/register">Регистрация</Link>
        </p>
      </Card>
    </div>
  );
}
