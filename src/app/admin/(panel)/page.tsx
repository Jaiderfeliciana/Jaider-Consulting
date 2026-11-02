import Link from "next/link";
import BarChart from "@/components/admin/BarChart";
import LineChart from "@/components/admin/LineChart";
import GoalRing from "@/components/admin/GoalRing";
import MiniCalendar from "@/components/admin/MiniCalendar";
import { NotConnected, PageHead, Stat } from "@/components/admin/Bits";
import { getBookings, isCalConfigured } from "@/lib/admin/cal";
import { getClients, getPayments, getVisits } from "@/lib/admin/data";
import { fromDb } from "@/lib/admin/load";
import { adminConfig } from "@/lib/admin/config";
import { dateTime, dayKey, lastMonths, monthKey, monthLabel, money, shortDate } from "@/lib/admin/dates";

export default async function Overview() {
  const [bookings, clients, payments, visits] = await Promise.all([
    getBookings(), fromDb(getClients), fromDb(getPayments), fromDb(() => getVisits(30)),
  ]);

  const thisMonth = monthKey();
  const months = lastMonths(12);
  const pay = "data" in payments ? payments.data : [];
  const perMonth = months.map((m) => pay.filter((p) => p.date.startsWith(m)).reduce((s, p) => s + p.amount, 0));
  const monthTotal = perMonth[perMonth.length - 1];
  const yearTotal = pay.filter((p) => p.date.startsWith(thisMonth.slice(0, 4))).reduce((s, p) => s + p.amount, 0);

  const cl = "data" in clients ? clients.data : [];
  const leads = cl.filter((c) => c.status === "Lead").length;

  const v = "data" in visits ? visits.data : null;
  const visitors30 = v ? v.days.reduce((s, d) => s + d.visitors, 0) : 0;

  const active = bookings.upcoming.filter((b) => b.status !== "cancelled");
  const bookedDays: Record<string, number> = {};
  for (const b of [...active, ...bookings.past]) {
    if (b.status === "cancelled") continue;
    const d = dayKey(new Date(b.start));
    if (d.startsWith(thisMonth)) bookedDays[d] = (bookedDays[d] ?? 0) + 1;
  }

  return (
    <>
      <PageHead title="Overview" sub={`${monthLabel(thisMonth, "long")} · all amounts in USD`} />

      <section className="stats-row">
        <Stat dark label="Earnings this month" value={"data" in payments ? money(monthTotal) : "—"} note={"data" in payments ? `${money(yearTotal)} this year` : "Database not connected"} />
        <Stat label="Upcoming sessions" value={isCalConfigured() && !bookings.error ? String(active.length) : "—"} note={isCalConfigured() ? (bookings.error ? "Cal.com error" : active[0] ? `Next: ${dateTime(active[0].start)}` : "Nothing booked yet") : "Cal.com not connected"} />
        <Stat label="Clients" value={"data" in clients ? String(cl.length) : "—"} note={"data" in clients ? `${leads} new lead${leads === 1 ? "" : "s"}` : "Database not connected"} />
        <Stat label="Visitors" value={v ? String(visitors30) : "—"} note={v ? "last 30 days" : "Database not connected"} />
      </section>

      <section className="grid-2">
        <div className="card">
          <div className="card-head">
            <h2>Earnings per month</h2>
            <Link href="/admin/earnings" className="a-btn a-btn-small">Add payment</Link>
          </div>
          {"data" in payments ? (
            <BarChart
              bars={months.map((m, i) => ({ label: monthLabel(m), value: perMonth[i], detail: money(perMonth[i]) }))}
              summary={`Earnings per month for the last 12 months. This month: ${money(monthTotal)}.`}
            />
          ) : <NotConnected what="Earnings" error={"error" in payments ? payments.error : undefined} />}
        </div>

        <div className="card card-center">
          <h2>Monthly goal</h2>
          <GoalRing value={monthTotal} goal={adminConfig.monthlyGoal} />
          <p className="goal-text"><strong>{money(monthTotal)}</strong> of {money(adminConfig.monthlyGoal)}</p>
          <ul className="next-list">
            {active.slice(0, 3).map((b) => (
              <li key={b.id}><span>{dateTime(b.start)}</span><span>{b.name}</span></li>
            ))}
            {isCalConfigured() && !bookings.error && active.length === 0 && <li className="muted">No upcoming sessions</li>}
          </ul>
          <Link href="/admin/bookings" className="a-btn a-btn-small">All bookings</Link>
        </div>
      </section>

      <section className="grid-2">
        <div className="card">
          <div className="card-head">
            <h2>Visitors, last 30 days</h2>
            <Link href="/admin/visitors" className="a-link">Details →</Link>
          </div>
          {v ? (
            <LineChart
              unit="visitors"
              points={v.days.map((d) => ({ label: shortDate(d.day), value: d.visitors, extra: `${d.views} page views` }))}
              summary={`Website visitors per day for the last 30 days, ${visitors30} in total.`}
            />
          ) : <NotConnected what="Visitor counting" error={"error" in visits ? visits.error : undefined} />}
        </div>
        <div className="card">
          <h2>Sessions this month</h2>
          {isCalConfigured()
            ? bookings.error ? <NotConnected what="Cal.com" error={bookings.error} /> : <MiniCalendar bookedDays={bookedDays} />
            : <NotConnected what="Cal.com bookings" />}
        </div>
      </section>
    </>
  );
}
