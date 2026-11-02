import Link from "next/link";
import LineChart from "@/components/admin/LineChart";
import Sparkline from "@/components/admin/Sparkline";
import Donut from "@/components/admin/Donut";
import Icon from "@/components/admin/Icon";
import { NotConnected, PageHead } from "@/components/admin/Bits";
import { getBookings, isCalConfigured } from "@/lib/admin/cal";
import { getClients, getPayments, getVisits, type Client, type Payment } from "@/lib/admin/data";
import { fromDb } from "@/lib/admin/load";
import { otherGroup, serviceGroups, statusProgress } from "@/lib/admin/config";
import { dateTime, dayKey, lastDays, lastMonths, monthLabel, money, shortDate } from "@/lib/admin/dates";

const RANGES = [7, 30, 90] as const;

// "+24%" compared with the previous period of the same length.
function trend(now: number, before: number) {
  if (before === 0) return now > 0 ? { text: "new", up: true } : null;
  const pct = Math.round(((now - before) / before) * 100);
  return { text: `${pct >= 0 ? "+" : ""}${pct}%`, up: pct >= 0 };
}

function ago(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d} day${d === 1 ? "" : "s"} ago` : shortDate(dayKey(new Date(iso)));
}

function StatCard({ icon, label, value, change, note, spark, color, dark }: {
  icon: string; label: string; value: string; change: ReturnType<typeof trend>; note: string;
  spark: number[]; color: string; dark?: boolean;
}) {
  return (
    <div className={dark ? "kpi kpi-dark" : "kpi"}>
      <div className="kpi-top">
        <span className="kpi-icon" style={{ color, background: dark ? "rgba(255,255,255,0.12)" : `${color}1f` }}><Icon name={icon} size={24} /></span>
        <div>
          <p className="kpi-label">{label}</p>
          <p className="kpi-value">
            {value}
            {change && <span className={change.up ? "kpi-trend up" : "kpi-trend down"}>{change.up ? "↑" : "↓"} {change.text}</span>}
          </p>
        </div>
      </div>
      <Sparkline values={spark} color={dark ? "#b794ff" : color} id={`spark-${label.replace(/\W/g, "")}`} />
      <p className="kpi-note">{note}</p>
    </div>
  );
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ range?: string; earn?: string }> }) {
  const params = await searchParams;
  const range = RANGES.find((r) => String(r) === params.range) ?? 30;
  const earnView = params.earn === "daily" ? "daily" : "monthly";

  const [bookings, clientsRes, paymentsRes, visitsRes] = await Promise.all([
    getBookings(), fromDb(getClients), fromDb(getPayments), fromDb(() => getVisits(range * 2)),
  ]);
  const dbOk = "data" in clientsRes && "data" in paymentsRes;
  const clients: Client[] = "data" in clientsRes ? clientsRes.data : [];
  const payments: Payment[] = "data" in paymentsRes ? paymentsRes.data : [];

  const days = lastDays(range * 2);
  const cur = days.slice(range), prev = days.slice(0, range);
  const inDays = (list: string[], day: string) => day >= list[0] && day <= list[list.length - 1];
  const clientDay = (c: Client) => dayKey(new Date(c.createdAt));

  // Revenue
  const revenueOn = (d: string) => payments.filter((p) => p.date === d).reduce((s, p) => s + p.amount, 0);
  const revenue = cur.reduce((s, d) => s + revenueOn(d), 0);
  const revenuePrev = prev.reduce((s, d) => s + revenueOn(d), 0);
  let run = 0;
  const revenueSpark = cur.map((d) => (run += revenueOn(d)));

  // Clients & leads
  const active = clients.filter((c) => c.status === "Active").length;
  const newIn = (list: string[]) => clients.filter((c) => inDays(list, clientDay(c)));
  const leadsNow = newIn(cur).length, leadsPrev = newIn(prev).length;
  const before = clients.filter((c) => clientDay(c) < cur[0]).length;
  let total = before;
  const clientSpark = cur.map((d) => (total += clients.filter((c) => clientDay(c) === d).length));
  const leadSpark = cur.map((d) => clients.filter((c) => clientDay(c) === d).length);

  // Visitors
  const visits = "data" in visitsRes ? visitsRes.data.days : null;
  const visitorsNow = visits ? visits.slice(range).reduce((s, d) => s + d.visitors, 0) : 0;
  const visitorsPrev = visits ? visits.slice(0, range).reduce((s, d) => s + d.visitors, 0) : 0;

  // Earnings chart
  const earnPoints = earnView === "monthly"
    ? lastMonths(12).map((m) => ({ label: monthLabel(m), value: payments.filter((p) => p.date.startsWith(m)).reduce((s, p) => s + p.amount, 0) }))
    : lastDays(30).map((d) => ({ label: shortDate(d), value: revenueOn(d) }));

  // Top services
  const slices = [...serviceGroups.map((g) => ({ name: g.name, color: g.color, value: clients.filter((c) => g.services.includes(c.service)).length }))];
  const other = clients.filter((c) => !serviceGroups.some((g) => g.services.includes(c.service))).length;
  if (other) slices.push({ ...otherGroup, value: other });
  const groupColor = (service: string) => serviceGroups.find((g) => g.services.includes(service))?.color ?? otherGroup.color;

  // Recent activity: new clients and payments, newest first
  const activity = [
    ...clients.map((c) => ({ at: c.createdAt, icon: "user", title: c.status === "Lead" ? "New lead" : "New client added", text: `${c.name}${c.service ? ` · ${c.service}` : ""}` })),
    ...payments.map((p) => ({ at: p.createdAt, icon: "dollar", title: "Payment received", text: `${money(p.amount)}${p.client ? ` from ${p.client}` : ""}${p.description ? ` · ${p.description}` : ""}` })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5);

  const upcoming = bookings.upcoming.filter((b) => b.status !== "cancelled").slice(0, 4);
  const today = dayKey();
  const dayChip = (iso: string) => {
    const d = dayKey(new Date(iso));
    if (d === today) return "Today";
    const t = new Date(`${today}T12:00:00Z`); t.setUTCDate(t.getUTCDate() + 1);
    return d === t.toISOString().slice(0, 10) ? "Tomorrow" : shortDate(d);
  };

  const rangeLabel = `Last ${range} days`;
  const rangeSelect = (
    <details className="range">
      <summary><Icon name="calendar" size={18} /> {rangeLabel} <Icon name="chevron" size={16} /></summary>
      <div className="range-menu">
        {RANGES.map((r) => (
          <Link key={r} href={`/admin?range=${r}${earnView === "daily" ? "&earn=daily" : ""}`} className={r === range ? "is-active" : undefined}>Last {r} days</Link>
        ))}
      </div>
    </details>
  );

  return (
    <>
      <PageHead icon="chart" title="Dashboard" sub="Welcome back, Jaider! Here's what's happening with your business." action={rangeSelect} />

      <section className="kpis">
        <StatCard dark icon="wallet" label="Revenue" value={dbOk ? money(revenue) : "—"} change={dbOk ? trend(revenue, revenuePrev) : null}
          note={dbOk ? rangeLabel : "Database not connected"} spark={revenueSpark} color="#b794ff" />
        <StatCard icon="users" label="Active clients" value={dbOk ? String(active) : "—"} change={null}
          note={dbOk ? `${clients.length} client${clients.length === 1 ? "" : "s"} in total` : "Database not connected"} spark={clientSpark} color="#6a3ff2" />
        <StatCard icon="star" label="New leads" value={dbOk ? String(leadsNow) : "—"} change={dbOk ? trend(leadsNow, leadsPrev) : null}
          note={dbOk ? rangeLabel : "Database not connected"} spark={leadSpark} color="#e0479e" />
        <StatCard icon="eye" label="Visitors" value={visits ? visitorsNow.toLocaleString("en-US") : "—"} change={visits ? trend(visitorsNow, visitorsPrev) : null}
          note={visits ? rangeLabel : "Database not connected"} spark={visits ? visits.slice(range).map((d) => d.visitors) : [0, 0]} color="#1d8fd8" />
      </section>

      <section className="dash-row dash-row-top">
        <div className="card">
          <div className="card-head">
            <h2><Icon name="chart" size={20} /> Earnings overview</h2>
            <div className="tabs">
              <Link href={`/admin?range=${range}`} className={earnView === "monthly" ? "is-active" : undefined}>12 months</Link>
              <Link href={`/admin?range=${range}&earn=daily`} className={earnView === "daily" ? "is-active" : undefined}>30 days</Link>
            </div>
          </div>
          {"data" in paymentsRes
            ? <LineChart kind="usd" points={earnPoints} summary={`Earnings per ${earnView === "monthly" ? "month, last 12 months" : "day, last 30 days"}.`} />
            : <NotConnected what="Earnings" error={"error" in paymentsRes ? paymentsRes.error : undefined} />}
        </div>

        <div className="card">
          <div className="card-head"><h2><Icon name="gem" size={20} /> Top services</h2></div>
          {"data" in clientsRes
            ? clients.length ? <Donut slices={slices} /> : <p className="muted">Add clients to see which services they want.</p>
            : <NotConnected what="Clients" error={"error" in clientsRes ? clientsRes.error : undefined} />}
        </div>

        <div className="promo">
          <span className="promo-art"><Icon name="rocket" size={64} /></span>
          <h2>Grow your business</h2>
          <p>Add a new client and follow them from first contact to finished project.</p>
          <Link href="/admin/clients?add=1#add" className="promo-btn">Add new client <Icon name="arrow" size={18} /></Link>
        </div>
      </section>

      <section className="dash-row">
        <div className="card">
          <div className="card-head">
            <h2><Icon name="folder" size={20} /> Recent clients</h2>
            <Link href="/admin/clients" className="view-all">View all <Icon name="arrow" size={16} /></Link>
          </div>
          {!dbOk ? <NotConnected what="Clients" /> : clients.length === 0 ? <p className="muted">No clients yet.</p> : (
            <ul className="recent">
              {clients.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <span className="recent-avatar" style={{ background: groupColor(c.service) }}>{c.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</span>
                  <div className="recent-main">
                    <p className="recent-name">{c.business || c.name}</p>
                    <span className="progress"><span style={{ width: `${statusProgress[c.status] ?? 20}%`, background: groupColor(c.service) }} /></span>
                  </div>
                  <span className={`pill pill-${c.status.toLowerCase()}`}>{c.status}</span>
                  <span className="recent-date">{shortDate(dayKey(new Date(c.createdAt)))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <h2><Icon name="bolt" size={20} /> Recent activity</h2>
            <Link href="/admin/earnings" className="view-all">View all <Icon name="arrow" size={16} /></Link>
          </div>
          {!dbOk ? <NotConnected what="Activity" /> : activity.length === 0 ? <p className="muted">Nothing yet. New clients and payments will show up here.</p> : (
            <ul className="timeline">
              {activity.map((a, i) => (
                <li key={i}>
                  <span className={`timeline-icon ${a.icon === "dollar" ? "is-money" : ""}`}><Icon name={a.icon} size={18} /></span>
                  <div>
                    <p className="timeline-title">{a.title}<span>{ago(a.at)}</span></p>
                    <p className="timeline-text">{a.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="card-head">
            <h2><Icon name="check" size={20} /> Upcoming sessions</h2>
            <Link href="/admin/bookings" className="view-all">View all <Icon name="arrow" size={16} /></Link>
          </div>
          {!isCalConfigured() ? <NotConnected what="Cal.com bookings" /> : bookings.error ? <NotConnected what="Cal.com" error={bookings.error} /> : upcoming.length === 0 ? <p className="muted">No upcoming sessions.</p> : (
            <ul className="sessions">
              {upcoming.map((b) => (
                <li key={b.id}>
                  <div>
                    <p className="sessions-name">{b.name}</p>
                    <p className="sessions-meta">{b.session} · {dateTime(b.start).split(", ").slice(-1)[0]}</p>
                  </div>
                  <span className="chip">{dayChip(b.start)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
