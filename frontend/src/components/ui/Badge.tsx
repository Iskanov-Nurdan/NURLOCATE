type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "muted";

const styles: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-green-100 text-mint",
  warning: "bg-amber-100 text-amber",
  danger:  "bg-red-100 text-critical",
  info:    "bg-blue-100 text-blue-600",
  muted:   "bg-slate-100 text-muted",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusDot({ online }: { online: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${online ? "bg-mint" : "bg-muted"}`}
    />
  );
}

export function DeviceStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    active:    "success",
    offline:   "muted",
    blocked:   "danger",
    unclaimed: "warning",
  };
  const labels: Record<string, string> = {
    active:    "онлайн",
    offline:   "оффлайн",
    blocked:   "заблокирован",
    unclaimed: "не привязан",
  };
  return <Badge variant={map[status] ?? "default"}>{labels[status] ?? status}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, BadgeVariant> = {
    super_admin: "danger",
    admin:       "warning",
    user:        "muted",
  };
  const labels: Record<string, string> = {
    super_admin: "Super Admin",
    admin:       "Admin",
    user:        "User",
  };
  return <Badge variant={map[role] ?? "default"}>{labels[role] ?? role}</Badge>;
}

export function LevelBadge({ level }: { level: string }) {
  const map: Record<string, BadgeVariant> = {
    critical: "danger",
    warning:  "warning",
    info:     "info",
  };
  return <Badge variant={map[level] ?? "muted"}>{level}</Badge>;
}
