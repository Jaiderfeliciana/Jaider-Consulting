import Link from "next/link";
import { NotConnected, PageHead, Stat } from "@/components/admin/Bits";
import { setClientStatus } from "@/app/admin/actions";
import { getClients, getGoals } from "@/lib/admin/data";
import { getBookings, isCalConfigured } from "@/lib/admin/cal";
import { fromDb } from "@/lib/admin/load";
import { dateTime, dayKey, monthKey, monthLabel, shortDate } from "@/lib/admin/dates";

// New business in one place: leads to follow up, plus this month's inquiries and consultation bookings.
export default async function LeadsPage() {
  const month = monthKey();
  const [res, bookings] = await Promise.all([fromDb(() => Promise.all([getClients(), getGoals(month)])), getBookings()]);
  if (!("data" in res)) {
    return <><PageHead icon="star" title="Leads & Inquiries" /><NotConnected what="The database" error={"error" in res ? res.error : undefined} /></>;
  }
  const [clients, goals] = res.data;
  const leads = clients.filter((c) => c.status === "Lead");
  const consultations = bookings.upcoming.filter((b) => b.status !== "cancelled" && /consult/i.test(b.session));

  return (
    <>
      <PageHead icon="star" title="Leads & Inquiries" sub={`New business, ${monthLabel(month, "long")}`}
        action={<Link href="/admin/clients?add=1#add" className="a-btn a-btn-primary">+ Add a lead</Link>} />
      <section className="stats-row">
        <Stat dark label="Open leads" value={String(leads.length)} note="clients with status Lead" />
        <Stat label="Inquiries sent" value={String(goals.inquiry)} note="from the website form this month" />
        <Stat label="Consultations booked" value={String(goals.consultation)} note="on the booking page this month" />
        <Stat label="Upcoming consultations" value={isCalConfigured() && !bookings.error ? String(consultations.length) : "—"} note={isCalConfigured() ? "from Cal.com" : "Cal.com not connected"} />
      </section>

      <div className="card">
        <h2>Leads to follow up</h2>
        {leads.length === 0 ? <p className="muted">No open leads. New website inquiries arrive on your WhatsApp; add them here as leads.</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Lead</th><th>Interested in</th><th>Contact</th><th>Added</th><th /></tr></thead>
              <tbody>
                {leads.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong>{c.business && <><br /><span className="muted">{c.business}</span></>}</td>
                    <td>{c.service || "—"}</td>
                    <td>{c.contact || "—"}</td>
                    <td>{shortDate(dayKey(new Date(c.createdAt)))}</td>
                    <td className="num">
                      <form action={setClientStatus} className="inline-form">
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="status" value="Active" />
                        <button type="submit" className="a-btn a-btn-small">Won → Active</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCalConfigured() && !bookings.error && (
        <div className="card">
          <h2>Upcoming consultations</h2>
          {consultations.length === 0 ? <p className="muted">No consultations booked yet.</p> : (
            <ul className="next-list">
              {consultations.slice(0, 10).map((b) => <li key={b.id}><span>{dateTime(b.start)}</span><span>{b.name} · {b.session}</span></li>)}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
