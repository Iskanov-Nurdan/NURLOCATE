import {
  Activity,
  Bell,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Dog,
  LogOut,
  MapPin,
  Moon,
  Search,
  Settings,
  ShieldAlert,
  Sun,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { listAnimals } from "../../api/animals";
import { listNotifications } from "../../api/notifications";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import type { Animal } from "../../types";
import { petAccent } from "../../utils/format";

const nav = [
  { to: "/app/map",       label: "Live Map",   icon: MapPin },
  { to: "/app/history",   label: "История",    icon: Activity },
  { to: "/app/geofences", label: "Геозоны",   icon: ShieldAlert },
  { to: "/app/billing",   label: "Оплата",     icon: CreditCard },
  { to: "/app/settings",  label: "Настройки",  icon: Settings },
];

export function OwnerLayout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [query, setQuery] = useState("");
  const [unread, setUnread] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    listAnimals().then(setAnimals).catch(() => setAnimals([]));
    listNotifications()
      .then((items) => setUnread(items.filter((n) => !n.is_read).length))
      .catch(() => setUnread(0));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return animals;
    return animals.filter(
      (a) => a.name.toLowerCase().includes(q) || a.breed.toLowerCase().includes(q)
    );
  }, [animals, query]);

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* ── Sidebar ── */}
      <aside
        className={`flex shrink-0 flex-col bg-[#0a0a0a] transition-[width] duration-300 ease-in-out ${
          collapsed ? "w-[68px]" : "w-[240px]"
        }`}
      >
        {/* Logo + collapse */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-[18px]">
          {collapsed ? (
            <div className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
              <Dog size={16} />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
                  <Dog size={16} />
                </div>
                <span className="text-sm font-bold text-white">PetTrack OS</span>
              </div>
              <button
                onClick={() => setCollapsed(true)}
                className="rounded-md p-1 text-white/40 transition-colors hover:text-white"
              >
                <ChevronLeft size={17} />
              </button>
            </>
          )}
        </div>

        {/* Pets search — expanded only */}
        {!collapsed && (
          <div className="px-3 pt-4 pb-2 space-y-2">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3">
              <Search size={14} className="shrink-0 text-white/40" />
              <input
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                placeholder="Поиск питомца"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            {filtered.length > 0 && (
              <div className="sidebar-scroll max-h-36 space-y-0.5 overflow-auto">
                {filtered.map((pet) => (
                  <Link
                    key={pet.id}
                    to={`/app/animals/${pet.id}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/8"
                  >
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold"
                      style={{ background: petAccent(pet.name), color: "#07100d" }}
                    >
                      {pet.name[0]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-xs text-white">{pet.name}</strong>
                      <small className="text-[11px] text-white/40">{pet.breed}</small>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-accent text-white"
                    : "text-white/55 hover:bg-white/8 hover:text-white"
                } ${collapsed ? "justify-center px-2" : "px-3"}`
              }
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* Admin shortcuts — expanded only */}
        {!collapsed && (user?.is_staff || user?.is_superuser) && (
          <div className="border-t border-white/10 px-2 py-2">
            {user.is_staff && (
              <Link
                to="/admin"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/8 hover:text-white"
              >
                Admin Panel
              </Link>
            )}
            {user.is_superuser && (
              <Link
                to="/super-admin"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/8 hover:text-white"
              >
                Super Admin
              </Link>
            )}
          </div>
        )}

        {/* User info */}
        <div className="border-t border-white/10 p-3">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-accent/25 text-xs font-bold text-accent">
                {(user?.username ?? "U")[0].toUpperCase()}
              </div>
              <button
                onClick={() => logout().then(() => navigate("/login"))}
                className="text-white/40 transition-colors hover:text-white"
                title="Выйти"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/25 text-sm font-bold text-accent">
                {(user?.username ?? "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-white/40">Владелец</p>
              </div>
              <button
                onClick={() => logout().then(() => navigate("/login"))}
                className="text-white/40 transition-colors hover:text-white"
                title="Выйти"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-panel px-6 py-4">
          <div className="flex items-center gap-3">
            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="rounded-lg border border-border p-1.5 text-muted transition-colors hover:text-text"
              >
                <ChevronRight size={17} />
              </button>
            )}
            <h1 className="text-xl font-bold text-text">PetTrack OS</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text"
              title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link
              to="/app/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text"
            >
              <Bell size={17} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-0.5 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </Link>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-gray-100 hover:text-text"
              title={user?.username}
              onClick={() => navigate("/app/settings")}
            >
              <UserRound size={17} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <Outlet context={{ animals, setAnimals }} />
        </main>
      </div>
    </div>
  );
}
