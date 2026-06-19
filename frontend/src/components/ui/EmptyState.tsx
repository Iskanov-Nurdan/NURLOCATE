import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-border bg-surface text-muted">
          <Icon size={24} />
        </div>
      )}
      <p className="font-semibold text-text">{title}</p>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
    </div>
  );
}
