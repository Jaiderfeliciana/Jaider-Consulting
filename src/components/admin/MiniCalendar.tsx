import { dayKey, monthKey, monthLabel } from "@/lib/admin/dates";

// This month as a grid; days with sessions are filled, today is outlined.
export default function MiniCalendar({ bookedDays }: { bookedDays: Record<string, number> }) {
  const month = monthKey();
  const today = dayKey();
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Monday first
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
  ];

  return (
    <div className="mini-cal">
      <p className="mini-cal-title">{monthLabel(month, "long")}</p>
      <div className="mini-cal-grid">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} className="mini-cal-head">{d}</span>)}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const n = bookedDays[d] ?? 0;
          const cls = ["mini-cal-day", n ? "is-booked" : "", d === today ? "is-today" : ""].join(" ").trim();
          return (
            <span key={d} className={cls} title={n ? `${n} session${n > 1 ? "s" : ""}` : undefined}>
              {Number(d.slice(8))}
            </span>
          );
        })}
      </div>
      <p className="mini-cal-key"><span className="key-booked" /> session booked <span className="key-today" /> today</p>
    </div>
  );
}
