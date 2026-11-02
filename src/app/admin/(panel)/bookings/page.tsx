import { NotConnected, PageHead } from "@/components/admin/Bits";
import { getBookings, isCalConfigured, type Booking } from "@/lib/admin/cal";
import { dateTime } from "@/lib/admin/dates";

function Table({ rows, empty }: { rows: Booking[]; empty: string }) {
  if (!rows.length) return <p className="muted">{empty}</p>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>When (Aruba time)</th><th>Session</th><th>Client</th><th>Email</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id}>
              <td>{dateTime(b.start)}</td>
              <td>{b.session}</td>
              <td>{b.name}</td>
              <td>{b.email ? <a href={`mailto:${b.email}`}>{b.email}</a> : "—"}</td>
              <td><span className={`pill pill-${b.status === "cancelled" ? "off" : "on"}`}>{b.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function BookingsPage() {
  const manage = <a href="https://app.cal.com/bookings/upcoming" target="_blank" rel="noopener" className="a-btn a-btn-ghost">Manage in Cal.com ↗</a>;
  if (!isCalConfigured()) {
    return <><PageHead title="Bookings" action={manage} /><NotConnected what="Cal.com bookings" /></>;
  }
  const { upcoming, past, error } = await getBookings();
  return (
    <>
      <PageHead title="Bookings" sub="Sessions booked through your website planner." action={manage} />
      {error ? <NotConnected what="Cal.com" error={error} /> : (
        <>
          <div className="card"><h2>Upcoming ({upcoming.length})</h2><Table rows={upcoming} empty="No upcoming sessions." /></div>
          <div className="card"><h2>Past</h2><Table rows={past} empty="No past sessions yet." /></div>
        </>
      )}
    </>
  );
}
