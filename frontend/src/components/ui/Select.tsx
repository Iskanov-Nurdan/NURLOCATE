import type { SelectHTMLAttributes } from "react";

export function Select({
  label,
  children,
  options,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  children?: React.ReactNode;
  options?: { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      {label ? <span className="text-muted">{label}</span> : null}
      <select
        className={`h-11 rounded-card border border-border bg-surface px-3 text-white outline-none focus:border-accent ${className}`}
        {...props}
      >
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
    </label>
  );
}
