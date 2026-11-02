import { NotConnected, PageHead } from "@/components/admin/Bits";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { addClient, removeClient, setClientStatus } from "@/app/admin/actions";
import { getClients } from "@/lib/admin/data";
import { fromDb } from "@/lib/admin/load";
import { adminConfig } from "@/lib/admin/config";
import { contactTopics } from "@/content/site";

export default async function ClientsPage() {
  const clients = await fromDb(getClients);
  if (!("data" in clients)) {
    return <><PageHead title="Clients" /><NotConnected what="The database" error={"error" in clients ? clients.error : undefined} /></>;
  }
  const list = clients.data;
  return (
    <>
      <PageHead title="Clients" sub={`${list.length} client${list.length === 1 ? "" : "s"} · ${adminConfig.clientStatuses.map((s) => `${list.filter((c) => c.status === s).length} ${s.toLowerCase()}`).join(" · ")}`} />

      <details className="card add-card" open={list.length === 0}>
        <summary>+ Add a client</summary>
        <form action={addClient} className="a-form">
          <label>Name<input name="name" required placeholder="Maria Croes" /></label>
          <label>Business<input name="business" placeholder="Maria's Bakery" /></label>
          <label>WhatsApp or email<input name="contact" placeholder="+297 ... or name@email.com" /></label>
          <label>Website / social media<input name="links" placeholder="mariasbakery.aw, @mariasbakery" /></label>
          <label>Service
            <select name="service" defaultValue={contactTopics[0]}>{contactTopics.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          <label>Status
            <select name="status" defaultValue="Lead">{adminConfig.clientStatuses.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <label className="span-2">Notes<textarea name="notes" rows={3} placeholder="What they need, budget, next step…" /></label>
          <button type="submit" className="a-btn a-btn-primary">Save client</button>
        </form>
      </details>

      {list.length === 0 ? <p className="muted">No clients yet. Add your first one above.</p> : (
        <div className="client-grid">
          {list.map((c) => (
            <article key={c.id} className="card client">
              <div className="client-top">
                <div>
                  <h3>{c.name}</h3>
                  {c.business && <p className="muted">{c.business}</p>}
                </div>
                <span className={`pill pill-${c.status.toLowerCase()}`}>{c.status}</span>
              </div>
              <dl>
                {c.service && <><dt>Service</dt><dd>{c.service}</dd></>}
                {c.contact && <><dt>Contact</dt><dd>{c.contact}</dd></>}
                {c.links && <><dt>Links</dt><dd>{c.links}</dd></>}
                {c.notes && <><dt>Notes</dt><dd className="pre">{c.notes}</dd></>}
              </dl>
              <div className="client-actions">
                <form action={setClientStatus} className="inline-form">
                  <input type="hidden" name="id" value={c.id} />
                  <select name="status" defaultValue={c.status} aria-label={`Status of ${c.name}`}>
                    {adminConfig.clientStatuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button type="submit" className="a-btn a-btn-small">Update</button>
                </form>
                <form action={removeClient}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmButton message={`Delete ${c.name}? This can't be undone.`}>Delete</ConfirmButton>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
