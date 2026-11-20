import { NotConnected, PageHead } from "@/components/admin/Bits";
import BookingActions from "@/components/admin/BookingActions";
import { getBookings, isCalConfigured, type Booking } from "@/lib/admin/cal";
import { requireAdmin } from "@/lib/admin/auth";
import { dateTime } from "@/lib/admin/dates";

const statusLabel: Record<string, string> = { pending: "Waiting for you", accepted: "Accepted", cancelled: "Cancelled", rejected: "Declined" };
const statusPill = (s: string) => (s === "pending" ? "pill-wait" : s === "cancelled" || s === "rejected" ? "pill-off" : "pill-on");

const notices: Record<string, string> = {
  accept: "Booking accepted. Cal.com has emailed the client.",
  cancel: "Booking cancelled. Cal.com has emailed the client.",
  reschedule: "Session moved. Cal.com has emailed the client the new time.",
};

function Table({ rows, empty, actions }: { rows: Booking[]; empty: string; actions?: boolean }) {
  if (!rows.length) return <p className="muted">{empty}</p>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr><th>When (Aruba time)</th><th>Session</th><th>Client</th><th>Email</th><th>Status</th>{actions && <th>Actions</th>}</tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id}>
              <td>{dateTime(b.start)}</td>
              <td>{b.session}</td>
              <td>{b.name}</td>
              <td>{b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : "—"}</td>
              <td><span className={`pill ${statusPill(b.status)}`}>{statusLabel[b.status] ?? b.status}</span></td>
              {actions && (
                <td>
                  {b.status === "cancelled" || b.status === "rejected" ? "—" : (
                    <BookingActions id={b.id} status={b.status} slug={b.slug} start={b.start} name={b.name} session={b.session} />
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  await requireAdmin();
  const { done } = await searchParams;
  const manage = <a href="https://app.cal.com/bookings/upcoming" target="_blank" rel="noopener" className="a-btn a-btn-ghost">Manage in Cal.com ↗</a>;
  if (!isCalConfigured()) {
    return <><PageHead icon="calendar" title="Bookings" action={manage} /><NotConnected what="Cal.com bookings" /></>;
  }
  const { upcoming, past, error } = await getBookings();
  const waiting = upcoming.filter((b) => b.status === "pending").length;
  return (
    <>
      <PageHead icon="calendar" title="Bookings" sub="Sessions booked through your website planner. Accept, reschedule or cancel them here." action={manage} />
      {done && notices[done] && <p className="a-notice" role="status">{notices[done]}</p>}
      {error ? <NotConnected what="Cal.com" error={error} /> : (
        <>
          <div className="card">
            <h2>Upcoming ({upcoming.length}){waiting > 0 && <span className="pill pill-wait" style={{ marginLeft: 10, verticalAlign: "middle" }}>{waiting} waiting for you</span>}</h2>
            <Table rows={upcoming} empty="No upcoming sessions." actions />
          </div>
          <div className="card"><h2>Past</h2><Table rows={past} empty="No past sessions yet." /></div>
        </>
      )}
    </>
  );
}
