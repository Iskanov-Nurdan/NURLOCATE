import { Dog } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-[80px]" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-mint/8 blur-[60px]" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-white shadow-glow">
            <Dog size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">PetTrack OS</h1>
            <p className="mt-0.5 text-sm text-muted">GPS safety platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-[12px] border border-border bg-panel p-7 shadow-card">
          <p className="mb-6 text-base font-semibold text-text">Войти в аккаунт</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
              autoComplete="username"
              autoFocus
            />
            <Input
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="flex items-center gap-2 rounded-card border border-critical/30 bg-red-50 px-3 py-2.5 text-sm text-critical">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                {error}
              </div>
            )}

            <Button className="w-full" size="lg" loading={loading}>
              {loading ? "Входим..." : "Войти"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Нет аккаунта?{" "}
            <Link className="font-medium text-accent hover:text-red-700" to="/register">
              Зарегистрироваться
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted/60">
          © 2026 PetTrack OS · GPS safety for every animal
        </p>
      </div>
    </div>
  );
}
