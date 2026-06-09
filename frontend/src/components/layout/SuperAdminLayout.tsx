import { Activity, FileText, Settings, Shield, Users, Wallet } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/super-admin", label: "Overview", icon: Activity, end: true },
  { to: "/super-admin/admins", label: "Administrators", icon: Users },
  { to: "/super-admin/finance", label: "Finance", icon: Wallet },
  { to: "/super-admin/system", label: "System", icon: Shield },
  { to: "/super-admin/audit", label: "Audit Logs", icon: FileText },
  { to: "/super-admin/settings", label: "Settings", icon: Settings }
];

export function SuperAdminLayout() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-sm text-muted">Platform control</p>
          <h1 className="text-2xl font-bold">Super Admin</h1>
        </div>
        <div className="flex gap-3 text-sm">
          <Link to="/admin" className="text-muted hover:text-white">
            Admin Panel
          </Link>
          <Link to="/app/map" className="text-muted hover:text-white">
            Owner dashboard
          </Link>
        </div>
      </header>
      <div className="grid lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-border p-4 lg:border-b-0 lg:border-r">
          <nav className="flex flex-col gap-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-card px-3 py-2 text-sm ${
                    isActive ? "bg-mint/15 text-white" : "text-muted hover:bg-white/5 hover:text-white"
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
