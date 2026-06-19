import type { InputHTMLAttributes } from "react";

export function Input({
  label,
  error,
  hint,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      {label ? <span className="font-medium text-text">{label}</span> : null}
      <input
        className={`h-10 rounded-card border bg-panel px-3 text-text outline-none placeholder:text-muted/60 focus:ring-2 focus:ring-accent/25 transition-shadow
          ${
            error
              ? "border-critical focus:border-critical focus:ring-critical/20"
              : "border-border focus:border-accent/60"
          }
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-critical">{error}</span>}
      {hint && !error && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Textarea({
  label,
  error,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      {label ? <span className="font-medium text-text">{label}</span> : null}
      <textarea
        className={`min-h-[80px] rounded-card border bg-panel px-3 py-2.5 text-text outline-none placeholder:text-muted/60 focus:border-accent/60 focus:ring-2 focus:ring-accent/25 transition-shadow resize-y
          ${error ? "border-critical" : "border-border"}
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-critical">{error}</span>}
    </label>
  );
}
