import { hours } from "@/content/site";

// All admin dates use your business time zone (Aruba), not the server's.
export const TZ = hours.timeZone;

// "YYYY-MM-DD" for a moment, in the business time zone.
export const dayKey = (date: Date = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date);
export const monthKey = (date: Date = new Date()) => dayKey(date).slice(0, 7);

// The last `n` days as "YYYY-MM-DD", oldest first, ending today.
export function lastDays(n: number) {
  const today = dayKey();
  const [y, m, d] = today.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const t = new Date(Date.UTC(y, m - 1, d - (n - 1 - i)));
    return t.toISOString().slice(0, 10);
  });
}

// The last `n` months as "YYYY-MM", oldest first, ending this month.
export function lastMonths(n: number) {
  const [y, m] = monthKey().split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const t = new Date(Date.UTC(y, m - 1 - (n - 1 - i), 1));
    return t.toISOString().slice(0, 7);
  });
}

export const monthLabel = (key: string, style: "short" | "long" = "short") =>
  new Date(`${key}-01T12:00:00Z`).toLocaleString("en-US", { month: style, timeZone: "UTC", ...(style === "long" ? { year: "numeric" } : {}) });

export const shortDate = (key: string) =>
  new Date(`${key}T12:00:00Z`).toLocaleString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TZ });

export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);
