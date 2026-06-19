export function BatteryBar({ level }: { level: number }) {
  const color =
    level > 50 ? "bg-mint" : level > 20 ? "bg-amber" : "bg-critical";
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-2 w-16 overflow-hidden rounded-full bg-white/10">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all ${color}`}
          style={{ width: `${level}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted">{level}%</span>
    </div>
  );
}
