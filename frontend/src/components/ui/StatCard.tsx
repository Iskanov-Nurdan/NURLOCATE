import type { LucideIcon } from "lucide-react";

type Color = "blue" | "mint" | "amber" | "red" | "purple" | "default";

const colorMap: Record<Color, { icon: string; value: string }> = {
  blue:    { icon: "bg-blue-100 text-blue-600",    value: "text-blue-600" },
  mint:    { icon: "bg-green-100 text-mint",        value: "text-mint" },
  amber:   { icon: "bg-amber-100 text-amber",       value: "text-amber" },
  red:     { icon: "bg-red-100 text-critical",      value: "text-critical" },
  purple:  { icon: "bg-purple-100 text-purple-600", value: "text-purple-600" },
  default: { icon: "bg-slate-100 text-muted",       value: "text-text" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  color = "default",
  sub,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: Color;
  sub?: string;
}) {
  const c = colorMap[color];
  return (
    <div className="rounded-card border border-border bg-panel p-5 shadow-card">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted">{label}</p>
        {Icon && (
          <span className={`grid h-9 w-9 place-items-center rounded-lg ${c.icon}`}>
            <Icon size={17} />
          </span>
        )}
      </div>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${c.value}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}
