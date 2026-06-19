import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Dog,
  FileText,
  LogOut,
  Moon,
  Settings,
  Shield,
  Sun,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const links = [
  { to: "/super-admin",          label: "Обзор",            icon: Activity, end: true },
  { to: "/super-admin/admins",   label: "Администраторы",   icon: Users },
  { to: "/super-admin/finance",  label: "Финансы",          icon: Wallet },
  { to: "/super-admin/system",   label: "Система",          icon: Shield },
  { to: "/super-admin/audit",    label: "Аудит",            icon: FileText },
  { to: "/super-admin/settings", label: "Настройки",        icon: Settings },
];

export function SuperAdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

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
            <div className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-critical/80 text-white">
              <Shield size={16} />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-critical/80 text-white">
                  <Shield size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">PetTrack OS</p>
                  <p className="text-[11px] text-white/40">Super Admin</p>
                </div>
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

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 p-2 pt-3">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-critical/80 text-white"
                    : "text-white/55 hover:bg-white/8 hover:text-white"
                } ${collapsed ? "justify-center px-2" : "px-3"}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={`shrink-0 ${isActive ? "text-white" : ""}`} />
                  {!collapsed && label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Extra links — expanded only */}
        {!collapsed && (
          <div className="border-t border-white/10 px-2 py-2">
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/8 hover:text-white"
            >
              <Dog size={14} />
              Admin Panel
            </Link>
            <Link
              to="/app/map"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/8 hover:text-white"
            >
              <Activity size={14} />
              Dashboard
            </Link>
          </div>
        )}

        {/* User info */}
        <div className="border-t border-white/10 p-3">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-critical/20 text-xs font-bold text-critical">
                {(user?.username ?? "S")[0].toUpperCase()}
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
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-critical/20 text-sm font-bold text-critical">
                {(user?.username ?? "S")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-white/40">Super Admin</p>
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
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">Platform control</p>
              <h1 className="text-xl font-bold text-text">Super Admin</h1>
            </div>
          </div>
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:bg-gray-100 dark:hover:bg-white/8 hover:text-text"
            title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
