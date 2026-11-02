import LineChart from "@/components/admin/LineChart";
import { NotConnected, PageHead, Stat } from "@/components/admin/Bits";
import { getVisits } from "@/lib/admin/data";
import { fromDb } from "@/lib/admin/load";
import { monthKey, monthLabel, shortDate } from "@/lib/admin/dates";

export default async function VisitorsPage() {
  const visits = await fromDb(() => getVisits(90));
  if (!("data" in visits)) {
    return <><PageHead icon="eye" title="Visitors" /><NotConnected what="Visitor counting" error={"error" in visits ? visits.error : undefined} /></>;
  }
  const { days, topPages } = visits.data;
  const total = (n: number, k: "visitors" | "views") => days.slice(-n).reduce((s, d) => s + d[k], 0);
  return (
    <>
      <PageHead icon="eye" title="Visitors" sub="Counted on your website, without cookies or personal data." />
      <section className="stats-row">
        <Stat dark label="Today" value={String(days[days.length - 1].visitors)} note={`${days[days.length - 1].views} page views`} />
        <Stat label="Last 7 days" value={String(total(7, "visitors"))} note={`${total(7, "views")} page views`} />
        <Stat label="Last 30 days" value={String(total(30, "visitors"))} note={`${total(30, "views")} page views`} />
        <Stat label="Last 90 days" value={String(total(90, "visitors"))} note={`${total(90, "views")} page views`} />
      </section>
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
