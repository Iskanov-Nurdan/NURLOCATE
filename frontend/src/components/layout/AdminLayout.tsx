import { BarChart3, Cpu, Dog, Users } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin", label: "Overview", icon: BarChart3, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/devices", label: "Devices", icon: Cpu },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: Dog }
];

export function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-sm text-muted">Operations</p>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <div className="flex gap-3 text-sm">
          <Link to="/app/map" className="text-muted hover:text-white">
            Owner dashboard
          </Link>
          {user?.is_superuser && (
            <Link to="/super-admin" className="text-muted hover:text-white">
              Super Admin
            </Link>
          )}
        </div>
      </header>
      <div className="grid lg:grid-cols-[240px_1fr]">
        <aside className="border-b border-border p-4 lg:border-b-0 lg:border-r">
          <nav className="flex flex-col gap-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-card px-3 py-2 text-sm ${
                    isActive ? "bg-accent/15 text-white" : "text-muted hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
