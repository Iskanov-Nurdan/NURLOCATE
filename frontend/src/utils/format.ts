import { formatDistanceToNow, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export function formatRelativeTime(iso: string | null) {
  if (!iso) return "нет данных";
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ru });
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function petAccent(name: string) {
  const palette = ["#4de6a8", "#2d78ff", "#ffbd4a", "#ff6a6a", "#b388ff"];
  const index = name.charCodeAt(0) % palette.length;
  return palette[index];
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    online: "online",
    offline: "offline",
    warning: "warning",
    active: "active",
    blocked: "blocked",
    unclaimed: "unclaimed"
  };
  return map[status] ?? status;
}
