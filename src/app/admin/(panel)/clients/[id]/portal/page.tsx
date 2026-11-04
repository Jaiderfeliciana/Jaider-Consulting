import { notFound } from "next/navigation";
import { NotConnected, PageHead } from "@/components/admin/Bits";
import ResultForm from "@/components/admin/ResultForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import {
  addPortalLink, createPortal, postPortalUpdate, removePortal, removePortalLink, savePortalSettings, sendPortalInvite, setPortalEnabled, toggleStep,
} from "@/app/admin/portal-actions";
import { getClients, isDbConfigured } from "@/lib/admin/data";
import { getPortal } from "@/lib/portal/data";
import { isEmailConfigured } from "@/lib/portal/email";
import { isFilesConfigured } from "@/lib/portal/files";
import { dateTime } from "@/lib/admin/dates";

const fileUrl = (path: string) => `/portal/files/${path.split("/").map(encodeURIComponent).join("/")}`;

export default async function ClientPortalAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDbConfigured()) return <><PageHead icon="users" title="Client portal" /><NotConnected what="The database" /></>;
  const client = (await getClients()).find((c) => c.id === id);
  if (!client) notFound();
  const portal = await getPortal(id);
  const hidden = <input type="hidden" name="clientId" value={client.id} />;
  const services = [!isEmailConfigured() && "email (Resend)", !isFilesConfigured() && "file uploads (Vercel Blob)"].filter(Boolean);

  return (
    <>
      <PageHead icon="users" title={`${client.name} · Portal`} sub={client.business || client.service || undefined}
        action={<a className="a-btn a-btn-ghost" href="/portal" target="_blank" rel="noopener">Portal login page ↗</a>} />
      {services.length > 0 && (
        <div className="not-connected"><p><strong>Not connected yet: {services.join(" and ")}.</strong></p><p>Clients can&apos;t log in without email. See the Setup page.</p></div>
      )}

      {!portal ? (
        <div className="card">
          <h2>Create a portal for {client.name}</h2>
          <p className="muted">The client logs in with this email address and receives a one-time code.</p>
          <ResultForm action={createPortal} className="a-form portal-create" submit="Create portal">
            {hidden}
            <label>Client email<input name="email" type="email" required defaultValue={/@/.test(client.contact) ? client.contact : ""} placeholder="name@email.com" /></label>
          </ResultForm>
        </div>
      ) : (
        <>
          <div className="portal-admin-grid">
            <div className="card">
              <h2>Access</h2>
              <p className="muted">{portal.email} · {portal.enabled ? "can log in" : "access switched off"}</p>
              <div className="lm-actions">
                <ResultForm action={sendPortalInvite} submit="Email the invitation">{hidden}</ResultForm>
                <form action={setPortalEnabled}>
                  {hidden}
                  {!portal.enabled && <input type="hidden" name="enabled" value="on" />}
                  <button type="submit" className="a-btn a-btn-ghost">{portal.enabled ? "Switch off access" : "Switch on access"}</button>
                </form>
              </div>
            </div>
            <div className="card">
              <h2>Progress</h2>
              <ul className="tasks">
                {portal.steps.map((s, i) => (
                  <li key={i} className={s.done ? "is-done" : undefined}>
                    <form action={toggleStep}>
                      {hidden}<input type="hidden" name="index" value={i} />
                      <button type="submit" className="tick" aria-pressed={s.done} aria-label={`${s.done ? "Undo" : "Complete"} ${s.name}`}>{s.done ? "✓" : ""}</button>
                    </form>
                    <span className="task-title">{s.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card">
            <h2>Settings</h2>
            <ResultForm action={savePortalSettings} className="a-form portal-settings" submit="Save settings">
              {hidden}
              <label>Login email<input name="email" type="email" required defaultValue={portal.email} /></label>
              <label>Agreed price (USD)<input name="price" inputMode="decimal" defaultValue={portal.price} placeholder="e.g. 1000" /></label>
              <label className="span-2">Project steps, one per line<textarea name="steps" rows={6} defaultValue={portal.steps.map((s) => s.name).join("\n")} /></label>
              <label className="span-2">How to pay (shown while there is a balance)
                <textarea name="paymentInfo" rows={3} defaultValue={portal.paymentInfo} placeholder="e.g. Bank transfer to … or pay in person" />
              </label>
            </ResultForm>
          </div>

          <div className="card">
            <h2>Documents & links</h2>
            <p className="muted">Signed agreements with {portal.email} show up automatically. Add design previews, the live site, Drive folders or invoices.</p>
            <ul className="link-rows">
              {portal.links.map((l) => (
                <li key={l.id}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>
                  <form action={removePortalLink}>{hidden}<input type="hidden" name="linkId" value={l.id} /><button type="submit" className="a-btn a-btn-danger">Remove</button></form>
                </li>
              ))}
            </ul>
            <ResultForm action={addPortalLink} className="a-form a-form-row link-add" submit="Add link" reset>
              {hidden}
              <label>Name<input name="label" required placeholder="Homepage design preview" /></label>
              <label>Link<input name="url" required placeholder="https://…" /></label>
            </ResultForm>
          </div>

          <div className="card">
            <h2>Messages & files</h2>
            <ul className="thread">
              {portal.messages.length === 0 && <li className="muted">No messages yet.</li>}
              {portal.messages.map((m) => (
                <li key={m.id} className={m.from === "jaider" ? "from-me" : "from-them"}>
                  <p className="thread-meta">{m.from === "jaider" ? "You" : client.name} · {dateTime(m.at)}</p>
                  {m.text && <p className="thread-text">{m.text}</p>}
                  {m.files.map((f) => <p key={f.path} className="thread-file"><a href={fileUrl(f.path)} target="_blank" rel="noopener">📎 {f.name}</a></p>)}
                </li>
              ))}
            </ul>
            <ResultForm action={postPortalUpdate} className="a-form" submit="Post update" reset>
              {hidden}
              <label>Update for {client.name.split(" ")[0]}<textarea name="text" rows={3} required placeholder="The homepage design is ready for your review…" /></label>
              <label className="check"><input type="checkbox" name="notify" defaultChecked /> Also email it to the client</label>
            </ResultForm>
          </div>

          <div className="card">
            <form action={removePortal}>
              {hidden}
              <ConfirmButton message={`Delete ${client.name}'s portal, including its messages? This can't be undone.`}>Delete portal</ConfirmButton>
            </form>
          </div>
        </>
      )}
    </>
  );
}
