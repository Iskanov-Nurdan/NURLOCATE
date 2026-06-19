import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Option = { value: string; label: string };

type Props = {
  label?: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  options?: Option[];
  className?: string;
  placeholder?: string;
};

export function Select({ label, value, onChange, options = [], className = "", placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function pick(val: string) {
    onChange({ target: { value: val } });
    setOpen(false);
  }

  return (
    <div className={`relative grid gap-1.5 text-sm ${className}`} ref={ref}>
      {label && <span className="text-muted">{label}</span>}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-11 w-full items-center justify-between rounded-card border px-3 text-left transition-all duration-150 ${
          open
            ? "border-accent bg-panel shadow-[0_0_0_3px_rgba(220,38,38,0.12)]"
            : "border-border bg-panel hover:border-accent/50"
        }`}
      >
        <span className={selected ? "text-text" : "text-muted"}>
          {selected ? selected.label : (placeholder ?? "Выберите...")}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-card border border-border bg-panel shadow-xl shadow-black/10 animate-slide-up"
          style={{ minWidth: ref.current?.offsetWidth }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => pick(opt.value)}
                className={`flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors duration-100 ${
                  isSelected
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-text hover:bg-slate-50 hover:text-text"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check size={13} className="text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
