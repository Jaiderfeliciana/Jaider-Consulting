"use client";

import { useEffect, useMemo, useState } from "react";
import { hours } from "@/content/site";

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

function utcLabel(min: number) {
  const sign = min < 0 ? "−" : "+";
  const a = Math.abs(min);
  return `UTC${sign}${Math.floor(a / 60)}${a % 60 ? ":" + String(a % 60).padStart(2, "0") : ""}`;
}

const dayKey = (date: Date, timeZone: string) => new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);
const clock = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(date);
// Browsers still use some older city names; show the current ones.
const modernNames: Record<string, string> = {
  Calcutta: "Kolkata", Katmandu: "Kathmandu", Saigon: "Ho Chi Minh City", Kiev: "Kyiv", Rangoon: "Yangon",
  Asmera: "Asmara", Godthab: "Nuuk", Faeroe: "Faroe Islands", Ulan_Bator: "Ulaanbaatar", Dacca: "Dhaka",
  Thimbu: "Thimphu", Ujung_Pandang: "Makassar", Chungking: "Chongqing", Macao: "Macau", Truk: "Chuuk",
  Ponape: "Pohnpei", Enderbury: "Kanton", Buenos_Aires: "Buenos Aires", Indianapolis: "Indianapolis",
};
const cityName = (zone: string) => {
  const city = zone.split("/").slice(-1)[0];
  return (modernNames[city] ?? city).replace(/_/g, " ");
};

export default function HoursBar() {
  const [zone, setZone] = useState(hours.timeZone);
  const [zones, setZones] = useState<string[]>([hours.timeZone]);

  useEffect(() => {
    const all = (Intl as typeof Intl & { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone") ?? [];
    const mine = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const list = Array.from(new Set([hours.timeZone, ...all.filter((z) => z.includes("/")), ...(mine?.includes("/") ? [mine] : [])]));
    setZones(list);
    if (mine && list.includes(mine)) setZone(mine);
  }, []);

  const now = useMemo(() => new Date(), []);

  // Every time zone, grouped by region and labelled with its current UTC offset.
  const groups = useMemo(() => {
    const byRegion = new Map<string, { zone: string; label: string }[]>();
    for (const z of zones) {
      const region = z.split("/")[0];
      const label = `${cityName(z)} · ${utcLabel(offsetMinutes(z, now))}`;
      byRegion.set(region, [...(byRegion.get(region) ?? []), { zone: z, label }]);
    }
    return [...byRegion.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([region, items]) => [region, items.sort((a, b) => a.label.localeCompare(b.label))] as const);
  }, [zones, now]);

  const converted = useMemo(() => {
    const [y, m, d] = dayKey(now, hours.timeZone).split("-").map(Number);
    const start = zonedTime({ y, m, d }, hours.start, hours.timeZone);
    const end = zonedTime({ y, m, d }, hours.end, hours.timeZone);
    const base = dayKey(start, hours.timeZone);
    const shift = (date: Date) => Math.round((Date.parse(dayKey(date, zone)) - Date.parse(base)) / 86400000);
    const s = shift(start), e = shift(end);
    const note = s === e ? (s > 0 ? " (next day)" : s < 0 ? " (previous day)" : "") : ` (ends +${e - s} day)`;
    return `${clock(start, zone)}–${clock(end, zone)}${note}`;
  }, [zone, now]);

  const homeOffset = utcLabel(offsetMinutes(hours.timeZone, now));

  return (
    <div className="hours-bar">
      <div>
        <p className="eyebrow">Session hours</p>
        <p className="hours-main">{hours.days} · {hours.start}–{hours.end}</p>
        <p className="hours-sub">{hours.place} time ({homeOffset})</p>
      </div>
      <div className="hours-convert">
        <label>
          Your time zone
          <select value={zone} onChange={(e) => setZone(e.target.value)}>
            {groups.map(([region, items]) => (
              <optgroup key={region} label={region}>
                {items.map((it) => (
                  <option key={it.zone} value={it.zone}>{it.label}</option>
                ))}
              </optgroup>
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
