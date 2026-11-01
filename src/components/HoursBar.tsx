"use client";

import { useEffect, useMemo, useState } from "react";
import { hours } from "@/content/site";
import { countryTimeZones, timeZoneAliases } from "@/content/timezones";

// Minutes that `timeZone` is ahead of UTC at the given moment.
function offsetMinutes(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(date);
  const v = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"), v("second"));
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

// The moment it is `hh:mm` on the given calendar day in `timeZone`.
function zonedTime(day: { y: number; m: number; d: number }, hhmm: string, timeZone: string) {
  const [h, mi] = hhmm.split(":").map(Number);
  const guess = Date.UTC(day.y, day.m - 1, day.d, h, mi);
  let t = guess - offsetMinutes(timeZone, new Date(guess)) * 60000;
  t = guess - offsetMinutes(timeZone, new Date(t)) * 60000;
  return new Date(t);
}

function gmtLabel(min: number) {
  const sign = min < 0 ? "−" : "+";
  const a = Math.abs(min);
  return `GMT${sign}${Math.floor(a / 60)}${a % 60 ? ":" + String(a % 60).padStart(2, "0") : ""}`;
}

const dayKey = (date: Date, timeZone: string) => new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);
const clock = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
export default function HoursBar() {
  const [zone, setZone] = useState(hours.timeZone);
  // Offsets depend on today's date, so they are only worked out in the browser (the page itself is
  // prepared in advance, and its HTML must match what the browser renders first).
  const [now, setNow] = useState<Date | null>(null);

  // Pick the visitor's own time zone, matching other names for the same time (e.g. Asia/Calcutta).
  useEffect(() => {
    setNow(new Date());
    const mine = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const entry = timeZoneAliases[mine] ?? mine;
    if (countryTimeZones.some(([, , z]) => z === entry)) setZone(entry);
  }, []);

  // Every country, with its current GMT offset; a city is added when a country has several time zones.
  const options = useMemo(
    () => countryTimeZones.map(([country, city, z]) => ({
      zone: z,
      label: `${country}${city ? ` (${city})` : ""}${now ? ` · ${gmtLabel(offsetMinutes(z, now))}` : ""}`,
    })),
    [now],
  );

  const converted = useMemo(() => {
    if (!now) return `${hours.start}–${hours.end}`;
    const [y, m, d] = dayKey(now, hours.timeZone).split("-").map(Number);
    const start = zonedTime({ y, m, d }, hours.start, hours.timeZone);
    const end = zonedTime({ y, m, d }, hours.end, hours.timeZone);
    const base = dayKey(start, hours.timeZone);
    const shift = (date: Date) => Math.round((Date.parse(dayKey(date, zone)) - Date.parse(base)) / 86400000);
    const s = shift(start), e = shift(end);
    const note = s === e ? (s > 0 ? " (next day)" : s < 0 ? " (previous day)" : "") : ` (ends +${e - s} day)`;
    return `${clock(start, zone)}–${clock(end, zone)}${note}`;
  }, [zone, now]);

  const homeOffset = now ? ` (${gmtLabel(offsetMinutes(hours.timeZone, now))})` : "";

  return (
    <div className="hours-bar">
      <div>
        <p className="eyebrow">Session hours</p>
        <p className="hours-main">{hours.days} · {hours.start}–{hours.end}</p>
        <p className="hours-sub">{hours.place} time{homeOffset}</p>
      </div>
      <div className="hours-convert">
        <label>
          Your country
          <select value={zone} onChange={(e) => setZone(e.target.value)}>
            {options.map((o) => (
              <option key={o.zone} value={o.zone}>{o.label}</option>
            ))}
          </select>
        </label>
        <p className="hours-result">
          That&apos;s <strong>{converted}</strong> for you
        </p>
      </div>
    </div>
  );
}
