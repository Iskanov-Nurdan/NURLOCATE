import type { InputHTMLAttributes } from "react";

export function Input({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      {label ? <span className="text-muted">{label}</span> : null}
      <input
        className={`h-11 rounded-card border border-border bg-surface px-3 text-white outline-none focus:border-accent ${className}`}
        {...props}
      />
    </label>
  );
}
