import "server-only";
import { booking } from "@/content/site";

// Reads your bookings from Cal.com's API (v2). Needs CAL_API_KEY, created in
// Cal.com under Settings → Developer → API keys.

export type Booking = {
  id: string;
  start: string;
  end: string;
  session: string;
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

async function fetchBookings(status: "upcoming" | "past", take: number) {
  const base = (process.env.CAL_API_URL || "https://api.cal.com/v2").replace(/\/$/, "");
  const params = new URLSearchParams({ status, take: String(take), sortStart: status === "upcoming" ? "asc" : "desc" });
  const res = await fetch(`${base}/bookings?${params}`, {
    headers: { Authorization: `Bearer ${process.env.CAL_API_KEY}`, "cal-api-version": "2024-08-13" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(res.status === 401 || res.status === 403
      ? "Cal.com did not accept the API key. Check CAL_API_KEY in Vercel."
      : `Cal.com answered with an error (${res.status}).`);
  }
  const json = (await res.json()) as { data?: RawBooking[] | { bookings?: RawBooking[] } };
  const list = Array.isArray(json.data) ? json.data : json.data?.bookings ?? [];
  return list.map((b): Booking => ({
    id: String(b.uid ?? b.id),
    start: b.start ?? b.startTime ?? "",
    end: b.end ?? b.endTime ?? "",
    session: sessionName(b),
    name: b.attendees?.[0]?.name ?? "—",
    email: b.attendees?.[0]?.email ?? "",
    status: (b.status ?? "accepted").toLowerCase(),
  })).filter((b) => b.start);
}

export async function getBookings(): Promise<{ upcoming: Booking[]; past: Booking[]; error?: string }> {
  if (!isCalConfigured()) return { upcoming: [], past: [] };
  try {
    const [upcoming, past] = await Promise.all([fetchBookings("upcoming", 100), fetchBookings("past", 100)]);
    return { upcoming, past };
  } catch (e) {
    return { upcoming: [], past: [], error: e instanceof Error ? e.message : "Could not reach Cal.com." };
  }
}
