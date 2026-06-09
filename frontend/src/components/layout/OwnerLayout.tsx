import {
  Activity,
  Bell,
  CreditCard,
  Dog,
  MapPin,
  Search,
  Settings,
  ShieldAlert,
  UserRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { listAnimals } from "../../api/animals";
import { listNotifications } from "../../api/notifications";
import { useAuth } from "../../context/AuthContext";
import type { Animal } from "../../types";
import { petAccent } from "../../utils/format";

const nav = [
  { to: "/app/map", label: "Live Map", icon: MapPin },
  { to: "/app/history", label: "History", icon: Activity },
  { to: "/app/geofences", label: "Geofences", icon: ShieldAlert },
  { to: "/app/billing", label: "Billing", icon: CreditCard },
  { to: "/app/settings", label: "Settings", icon: Settings }
];

export function OwnerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [query, setQuery] = useState("");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    listAnimals().then(setAnimals).catch(() => setAnimals([]));
    listNotifications()
      .then((items) => setUnread(items.filter((n) => !n.is_read).length))
      .catch(() => setUnread(0));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return animals;
    return animals.filter((a) => a.name.toLowerCase().includes(q) || a.breed.toLowerCase().includes(q));
  }, [animals, query]);

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[280px_1fr]">
      <aside className="flex flex-col gap-5 border-b border-border bg-panel/85 p-5 backdrop-blur lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-card border border-mint/40 bg-mint/10 text-mint">
            <Dog size={22} />
          </div>
          <div>
            <strong>PetTrack OS</strong>
            <p className="text-xs text-muted">GPS safety platform</p>
          </div>
        </div>

        <label className="flex h-10 items-center gap-2 rounded-card border border-border bg-[#0b0f16] px-3 text-muted">
          <Search size={16} />
          <input
            className="w-full bg-transparent text-white outline-none"
            placeholder="Поиск питомца"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <section className="flex max-h-56 flex-col gap-2 overflow-auto">
          {filtered.map((pet) => (
            <Link
              key={pet.id}
              to={`/app/animals/${pet.id}`}
              className="flex items-center gap-3 rounded-card border border-transparent px-2 py-2 hover:border-accent/40 hover:bg-accent/10"
            >
              <span
                className="grid h-9 w-9 place-items-center rounded-card font-bold text-[#07100d]"
                style={{ background: petAccent(pet.name) }}
              >
                {pet.name[0]}
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate">{pet.name}</strong>
                <small className="text-muted">{pet.breed}</small>
              </span>
            </Link>
          ))}
        </section>

        <nav className="mt-auto flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex h-10 items-center gap-2 rounded-card px-3 text-sm ${
                  isActive ? "border border-accent/40 bg-accent/10 text-white" : "text-[#d7e0e7] hover:bg-white/5"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {(user?.is_staff || user?.is_superuser) && (
          <div className="flex flex-col gap-1 border-t border-border pt-3 text-sm">
            {user.is_staff && (
              <Link to="/admin" className="rounded-card px-3 py-2 text-muted hover:bg-white/5 hover:text-white">
                Admin Panel
              </Link>
            )}
            {user.is_superuser && (
              <Link to="/super-admin" className="rounded-card px-3 py-2 text-muted hover:bg-white/5 hover:text-white">
                Super Admin
              </Link>
            )}
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <p className="text-sm text-muted">Owner dashboard</p>
            <h1 className="text-2xl font-bold">PetTrack OS</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/app/notifications"
              className="relative grid h-10 w-10 place-items-center rounded-card border border-border bg-surface"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-critical px-1 text-[10px] font-bold">
                  {unread}
                </span>
              )}
            </Link>
            <button
              className="grid h-10 w-10 place-items-center rounded-card border border-border bg-surface"
              title={user?.username}
              onClick={() => navigate("/app/settings")}
            >
              <UserRound size={18} />
            </button>
            <button className="text-sm text-muted hover:text-white" onClick={() => logout().then(() => navigate("/login"))}>
              Выйти
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet context={{ animals, setAnimals }} />
        </main>
      </div>
    </div>
  );
}
