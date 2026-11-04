import LineChart from "@/components/admin/LineChart";
import { NotConnected, PageHead, Stat } from "@/components/admin/Bits";
import { getGoals, getVisits } from "@/lib/admin/data";
import { fromDb } from "@/lib/admin/load";
import { lastMonths, monthKey, monthLabel, shortDate } from "@/lib/admin/dates";

export default async function VisitorsPage() {
  const [prevMonth, thisMonth] = lastMonths(2);
  const visits = await fromDb(() => Promise.all([getVisits(90), getGoals(thisMonth), getGoals(prevMonth)]));
  if (!("data" in visits)) {
    return <><PageHead icon="eye" title="Analytics" /><NotConnected what="Visitor counting" error={"error" in visits ? visits.error : undefined} /></>;
  }
  const [{ days, topPages }, goals, prevGoals] = visits.data;
  const monthVisitors = days.filter((d) => d.day.startsWith(thisMonth)).reduce((s, d) => s + d.visitors, 0);
  const conversions = goals.consultation + goals.inquiry;
  const rate = monthVisitors ? Math.round((conversions / monthVisitors) * 1000) / 10 : 0;
  const bookingViews = topPages.find((p) => p.page === "Booking planner")?.views ?? 0;
  const total = (n: number, k: "visitors" | "views") => days.slice(-n).reduce((s, d) => s + d[k], 0);
  return (
    <>
      <PageHead icon="eye" title="Analytics" sub="Goals, visitors and pages. Counted on your website without cookies or personal data." />
      <section className="stats-row">
        <Stat dark label="Today" value={String(days[days.length - 1].visitors)} note={`${days[days.length - 1].views} page views`} />
        <Stat label="Last 7 days" value={String(total(7, "visitors"))} note={`${total(7, "views")} page views`} />
        <Stat label="Last 30 days" value={String(total(30, "visitors"))} note={`${total(30, "views")} page views`} />
        <Stat label="Last 90 days" value={String(total(90, "visitors"))} note={`${total(90, "views")} page views`} />
      </section>
      <div className="card">
        <h2>Goals, {monthLabel(thisMonth, "long")}</h2>
        <p className="muted goals-intro">Your two main goals: visitors booking a free consultation and sending a project inquiry.</p>
        <section className="stats-row">
          <Stat dark label="Consultations booked" value={String(goals.consultation)} note={`${prevGoals.consultation} last month`} />
          <Stat label="Project inquiries sent" value={String(goals.inquiry)} note={`${prevGoals.inquiry} last month`} />
          <Stat label="Booking page views" value={String(bookingViews)} note="people who opened /book" />
          <Stat label="Conversion rate" value={`${rate}%`} note={`${conversions} of ${monthVisitors} visitors`} />
        </section>
      </div>
      <div className="card">
        <h2>Visitors per day, last 90 days</h2>
        <LineChart
          unit="visitors"
          points={days.map((d) => ({ label: shortDate(d.day), value: d.visitors, extra: `${d.views} page views` }))}
          summary={`Website visitors per day for the last 90 days, ${total(90, "visitors")} in total.`}
        />
      </div>
      <div className="card">
        <h2>Most viewed pages, {monthLabel(monthKey(), "long")}</h2>
        {topPages.length === 0 ? <p className="muted">No page views this month yet.</p> : (
          <table className="table">
            <thead><tr><th>Page</th><th className="num">Views</th></tr></thead>
            <tbody>{topPages.map((p) => <tr key={p.page}><td>{p.page}</td><td className="num">{p.views}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </>
  );
}
