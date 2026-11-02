import Link from "next/link";
import BarChart from "@/components/admin/BarChart";
import Icon from "@/components/admin/Icon";
import AssistantCard from "@/components/admin/AssistantCard";
import InsightsCard from "@/components/admin/InsightsCard";
import { AddTaskForm, TaskRows } from "@/components/admin/TaskList";
import { NotConnected } from "@/components/admin/Bits";
import { getBookings } from "@/lib/admin/cal";
import { getClients, getPayments, getTasks, getVisits, type Client, type Payment, type Task } from "@/lib/admin/data";
import { fromDb } from "@/lib/admin/load";
import { isAssistantConfigured } from "@/lib/admin/assistant";
import { otherGroup, serviceGroups, statusProgress } from "@/lib/admin/config";
import { dateTime, dayKey, lastDays, money, shortDate } from "@/lib/admin/dates";

type Tab = "Lead" | "Active" | "Done" | "All";

// "+12%" (or "new") compared with the previous 30 days.
function trend(now: number, before: number) {
  if (before === 0) return now > 0 ? { text: "new", up: true } : null;
  const pct = Math.round(((now - before) / before) * 100);
  return { text: `${pct >= 0 ? "+" : ""}${pct}%`, up: pct >= 0 };
}

function Kpi({ title, icon, value, compare, change, highlight }: {
  title: string; icon: string; value: string; compare: string; change: ReturnType<typeof trend>; highlight?: boolean;
}) {
  return (
    <div className={highlight ? "kpi kpi-hi" : "kpi"}>
      <div className="kpi-head">
        <p className="kpi-title">{title}</p>
        <span className="kpi-icon"><Icon name={icon} size={22} /></span>
      </div>
      <p className="kpi-value">{value}</p>
      <p className="kpi-compare">
        {compare}
        {change && <span className={change.up ? "trend up" : "trend down"}>{change.up ? "↑" : "↓"} {change.text}</span>}
      </p>
    </div>
  );
}

export default async function Overview({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: tabParam } = await searchParams;
  const tab: Tab = (["Lead", "Active", "Done", "All"] as const).find((t) => t === tabParam) ?? "Active";

  const [bookings, clientsRes, paymentsRes, visitsRes, tasksRes] = await Promise.all([
    getBookings(), fromDb(getClients), fromDb(getPayments), fromDb(() => getVisits(60)), fromDb(getTasks),
  ]);
  const dbOk = "data" in clientsRes && "data" in paymentsRes;
  const clients: Client[] = "data" in clientsRes ? clientsRes.data : [];
  const payments: Payment[] = "data" in paymentsRes ? paymentsRes.data : [];
  const tasks: Task[] = "data" in tasksRes ? tasksRes.data : [];

  const days = lastDays(60), cur = days.slice(30), prev = days.slice(0, 30);
  const sumIn = (list: string[]) => payments.filter((p) => p.date >= list[0] && p.date <= list[list.length - 1]).reduce((s, p) => s + p.amount, 0);
  const revenue = sumIn(cur), revenuePrev = sumIn(prev);
  const clientsBefore = clients.filter((c) => dayKey(new Date(c.createdAt)) < cur[0]).length;
  const visits = "data" in visitsRes ? visitsRes.data.days : null;
  const visitorsNow = visits ? visits.slice(30).reduce((s, d) => s + d.visitors, 0) : 0;
  const visitorsPrev = visits ? visits.slice(0, 30).reduce((s, d) => s + d.visitors, 0) : 0;

  // Earnings: daily bars for 30 days, plus this month so far and a projection for the whole month.
  const today = dayKey();
  const monthSoFar = payments.filter((p) => p.date.startsWith(today.slice(0, 7))).reduce((s, p) => s + p.amount, 0);
  const dayOfMonth = Number(today.slice(8));
  const [y, m] = today.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const projected = Math.round((monthSoFar / dayOfMonth) * daysInMonth);

  // Clients table
  const counts = { Lead: 0, Active: 0, Done: 0 } as Record<string, number>;
  for (const c of clients) counts[c.status] = (counts[c.status] ?? 0) + 1;
  const rows = clients.filter((c) => tab === "All" || c.status === tab).slice(0, 6);
  const paidBy = (c: Client) => payments.filter((p) => p.client.toLowerCase().startsWith(c.name.toLowerCase())).reduce((s, p) => s + p.amount, 0);
  const groupColor = (service: string) => serviceGroups.find((g) => g.services.includes(service))?.color ?? otherGroup.color;

  const openTasks = tasks.filter((t) => !t.done);
  const leads = counts.Lead ?? 0;
  const next = bookings.upcoming.find((b) => b.status !== "cancelled");
  const tip = leads > 0
    ? `You have ${leads} lead${leads === 1 ? "" : "s"} waiting. Replying within 24 hours wins more clients. Run an analysis to see who to contact first.`
    : next
      ? `Your next session is ${dateTime(next.start)} with ${next.name}. Run an analysis to prepare and spot new opportunities.`
      : "Run an analysis and Grok will look at your revenue, clients and tasks and suggest what to focus on this week.";

  return (
    <div className="dash">
      <div className="dash-main">
        <section className="kpis">
          <Kpi highlight title="Clients" icon="users" value={dbOk ? String(clients.length) : "—"}
            compare={dbOk ? `Compare ${clientsBefore} (30 days ago)` : "Database not connected"} change={dbOk ? trend(clients.length, clientsBefore) : null} />
          <Kpi title="Revenue" icon="dollar" value={dbOk ? money(revenue) : "—"}
            compare={dbOk ? `${money(revenuePrev)} (previous 30 days)` : "Database not connected"} change={dbOk ? trend(revenue, revenuePrev) : null} />
          <Kpi title="Visitors" icon="eye" value={visits ? visitorsNow.toLocaleString("en-US") : "—"}
            compare={visits ? `Compare ${visitorsPrev} (previous 30 days)` : "Database not connected"} change={visits ? trend(visitorsNow, visitorsPrev) : null} />
        </section>

        <section className="mid">
          <InsightsCard connected={isAssistantConfigured()} tip={tip} />
          <div className="card earnings">
            <div className="card-head">
              <h2>Earnings last 30 days</h2>
              <span className="head-icon"><Icon name="wallet" size={22} /></span>
            </div>
            {"data" in paymentsRes ? (
              <>
                <BarChart average bars={cur.map((d) => {
                  const v = payments.filter((p) => p.date === d).reduce((s, p) => s + p.amount, 0);
                  return { label: shortDate(d).split(" ")[1], value: v, detail: `${money(v)} · ${shortDate(d)}` };
                })} summary={`Earnings per day for the last 30 days: ${money(revenue)} in total.`} />
                <div className="earn-foot">
                  <div><p>Earned this month</p><strong>{money(monthSoFar)}</strong></div>
                  <span className="earn-icon"><Icon name="chart" size={18} /></span>
                  <div className="right"><p>Projected</p><strong>{money(projected)}</strong></div>
                </div>
              </>
            ) : <NotConnected what="Earnings" error={"error" in paymentsRes ? paymentsRes.error : undefined} />}
          </div>
        </section>

        <section className="card manage">
          <div className="card-head">
            <h2>Manage clients</h2>
            <Link href="/admin/clients" className="head-icon" aria-label="All clients"><Icon name="users" size={22} /></Link>
          </div>
          {!dbOk ? <NotConnected what="Clients" /> : (
            <>
              <nav className="pill-tabs" aria-label="Filter clients">
                {(["Active", "Lead", "Done", "All"] as const).map((t) => (
                  <Link key={t} href={t === "Active" ? "/admin" : `/admin?tab=${t}`} className={t === tab ? "is-active" : undefined} scroll={false}>
                    {t === "Lead" ? "Leads" : t} <span className="count">{t === "All" ? clients.length : counts[t] ?? 0}</span>
                  </Link>
                ))}
              </nav>
              {rows.length === 0 ? <p className="muted">No {tab === "All" ? "" : `${tab.toLowerCase()} `}clients yet.</p> : (
                <div className="table-wrap">
                  <table className="table">
                    <thead><tr><th>Name</th><th>Service</th><th>Added</th><th className="num">Paid</th><th>Status</th><th aria-label="More" /></tr></thead>
                    <tbody>
                      {rows.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <div className="who">
                              <span className="who-avatar" style={{ background: groupColor(c.service) }}>{c.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</span>
                              <div><p>{c.name}</p><span>{c.business || c.contact || "—"}</span></div>
                            </div>
                          </td>
                          <td><p className="cell-main">{c.service || "—"}</p></td>
                          <td>{shortDate(dayKey(new Date(c.createdAt)))}</td>
                          <td className="num">{money(paidBy(c))}</td>
                          <td>
                            <span className="status">
                              <span className="bars" aria-hidden="true">
                                {Array.from({ length: 6 }, (_, i) => <i key={i} className={i < Math.round((statusProgress[c.status] ?? 20) / 100 * 6) ? "on" : undefined} />)}
                              </span>
                              {c.status}
                            </span>
                          </td>
                          <td className="num"><Link href="/admin/clients" className="more" aria-label={`Open ${c.name}`}>⋮</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <aside className="dash-side">
        <section className="card tasks-card">
          <div className="card-head">
            <h2>Priority tasks</h2>
            <Link href="/admin/tasks" className="see-all">See all</Link>
          </div>
          {"data" in tasksRes ? (
            <>
              <p className="tasks-progress">
                <span className="ring" style={{ background: `conic-gradient(var(--a-accent) ${tasks.length ? (100 * (tasks.length - openTasks.length)) / tasks.length : 0}%, rgba(255,255,255,0.12) 0)` }} />
                {tasks.length - openTasks.length}/{tasks.length} completed
              </p>
              {openTasks.length ? <TaskRows tasks={openTasks.slice(0, 4)} /> : <p className="muted">No open tasks. Add one below.</p>}
              <AddTaskForm />
            </>
          ) : <NotConnected what="Tasks" error={"error" in tasksRes ? tasksRes.error : undefined} />}
        </section>
        <AssistantCard connected={isAssistantConfigured()} />
      </aside>
    </div>
  );
}
