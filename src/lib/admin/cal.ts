import "server-only";
import { booking, hours } from "@/content/site";

// Reads and manages your bookings through Cal.com's API (v2). Needs CAL_API_KEY, created in
// Cal.com under Settings → Developer → API keys. Accepting, cancelling and rescheduling go
// through Cal.com, so it still emails the client and updates your calendar.

export type Booking = {
  id: string;
  start: string;
  end: string;
  session: string;
  // The event type's link name in Cal.com (e.g. "30min"), used to look up free times.
  slug: string;
  name: string;
  email: string;
  status: string;
};

export const isCalConfigured = () => Boolean(process.env.CAL_API_KEY);

type RawBooking = {
  id?: number | string; uid?: string; title?: string; status?: string;
  start?: string; end?: string; startTime?: string; endTime?: string;
  eventType?: { slug?: string; title?: string }; eventTypeSlug?: string;
  attendees?: { name?: string; email?: string }[];
};

function sessionName(b: RawBooking) {
  const slug = b.eventType?.slug ?? b.eventTypeSlug;
  return booking.sessions.find((s) => s.slug && s.slug === slug)?.title ?? b.eventType?.title ?? b.title ?? "Session";
}

function calFetch(path: string, init: { method?: string; body?: unknown; version?: string } = {}) {
  const base = (process.env.CAL_API_URL || "https://api.cal.com/v2").replace(/\/$/, "");
  return fetch(`${base}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${process.env.CAL_API_KEY}`,
      "cal-api-version": init.version ?? "2024-08-13",
      ...(init.body === undefined ? {} : { "content-type": "application/json" }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
}

async function calError(res: Response) {
  if (res.status === 401 || res.status === 403) return "Cal.com did not accept the API key. Check CAL_API_KEY in Vercel.";
  let detail = "";
  try {
    const j = (await res.json()) as { error?: { message?: string } | string; message?: string };
    detail = typeof j.error === "string" ? j.error : j.error?.message ?? j.message ?? "";
  } catch { /* not JSON */ }
  return `Cal.com answered with an error (${res.status})${detail ? `: ${detail}` : "."}`;
}

async function fetchBookings(status: "upcoming" | "unconfirmed" | "past", take: number) {
  const params = new URLSearchParams({ status, take: String(take), sortStart: status === "past" ? "desc" : "asc" });
  const res = await calFetch(`/bookings?${params}`);
  if (!res.ok) throw new Error(await calError(res));
  const json = (await res.json()) as { data?: RawBooking[] | { bookings?: RawBooking[] } };
  const list = Array.isArray(json.data) ? json.data : json.data?.bookings ?? [];
  return list.map((b): Booking => ({
    id: String(b.uid ?? b.id),
    start: b.start ?? b.startTime ?? "",
    end: b.end ?? b.endTime ?? "",
    session: sessionName(b),
    slug: b.eventType?.slug ?? b.eventTypeSlug ?? "",
    name: b.attendees?.[0]?.name ?? "—",
    email: b.attendees?.[0]?.email ?? "",
    status: (b.status ?? "accepted").toLowerCase(),
  })).filter((b) => b.start);
}

// `upcoming` includes bookings still waiting for you to accept (status "pending"), first by date.
export async function getBookings(): Promise<{ upcoming: Booking[]; past: Booking[]; error?: string }> {
  if (!isCalConfigured()) return { upcoming: [], past: [] };
  try {
    const [unconfirmed, upcoming, past] = await Promise.all([
      fetchBookings("unconfirmed", 100),
      fetchBookings("upcoming", 100),
      fetchBookings("past", 100),
    ]);
    const seen = new Set(unconfirmed.map((b) => b.id));
    const all = [...unconfirmed.map((b) => ({ ...b, status: "pending" })), ...upcoming.filter((b) => !seen.has(b.id))]
      .sort((a, b) => a.start.localeCompare(b.start));
    return { upcoming: all, past };
  } catch (e) {
    return { upcoming: [], past: [], error: e instanceof Error ? e.message : "Could not reach Cal.com." };
  }
}

// ---------- managing a booking ----------

type Result = { ok: true } | { ok: false; error: string };

async function post(path: string, body: unknown): Promise<Result> {
  if (!isCalConfigured()) return { ok: false, error: "Cal.com isn't connected yet." };
  try {
    const res = await calFetch(path, { method: "POST", body });
    return res.ok ? { ok: true } : { ok: false, error: await calError(res) };
  } catch {
    return { ok: false, error: "Could not reach Cal.com. Try again in a moment." };
  }
}

const uidPath = (uid: string) => `/bookings/${encodeURIComponent(uid)}`;

// For sessions that need your confirmation ("Requires confirmation" in Cal.com).
export const acceptBooking = (uid: string) => post(`${uidPath(uid)}/confirm`, {});

export const cancelBooking = (uid: string, reason: string) =>
  post(`${uidPath(uid)}/cancel`, { cancellationReason: reason || "Cancelled by Jaider Feliciana" });

// `start` is an ISO date-time. Cal.com moves the booking and emails the client the new time.
export const rescheduleBooking = (uid: string, start: string, reason: string) =>
  post(`${uidPath(uid)}/reschedule`, {
    start: new Date(start).toISOString(),
    reschedulingReason: reason || "Rescheduled by Jaider Feliciana",
  });

// Free start times on one day (YYYY-MM-DD, Aruba time) for a session, from your Cal.com availability.
export async function freeSlots(slug: string, day: string): Promise<{ slots: string[]; error?: string }> {
  if (!isCalConfigured()) return { slots: [], error: "Cal.com isn't connected yet." };
  const params = new URLSearchParams({ eventTypeSlug: slug, username: booking.calUsername, start: day, end: day, timeZone: hours.timeZone });
  try {
    const res = await calFetch(`/slots?${params}`, { version: "2024-09-04" });
    if (!res.ok) return { slots: [], error: await calError(res) };
    const json = (await res.json()) as { data?: Record<string, ({ start?: string } | string)[]> };
    const slots = Object.values(json.data ?? {}).flat()
      .map((s) => (typeof s === "string" ? s : s.start ?? ""))
      .filter(Boolean);
    return { slots };
  } catch {
    return { slots: [], error: "Could not reach Cal.com." };
  }
}
