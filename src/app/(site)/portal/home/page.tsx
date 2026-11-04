import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import Composer from "./Composer";
import { portalLogout } from "../actions";
import { currentPortal } from "@/lib/portal/auth";
import { getAgreements, getPayments } from "@/lib/admin/data";
import { isFilesConfigured } from "@/lib/portal/files";
import { dateTime, money, shortDate } from "@/lib/admin/dates";
import { whatsappHref } from "@/content/site";

export const metadata: Metadata = { title: "Your project — Jaider Feliciana", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const fileUrl = (path: string) => `/portal/files/${path.split("/").map(encodeURIComponent).join("/")}`;
const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default async function PortalHome() {
  const session = await currentPortal();
  if (!session) redirect("/portal");
  const { portal, client } = session;
  const [payments, agreements] = await Promise.all([getPayments(), getAgreements()]);
  const paid = payments.filter((p) => p.client.toLowerCase().startsWith(client.name.toLowerCase()));
  const paidTotal = paid.reduce((s, p) => s + p.amount, 0);
  const price = Number(portal.price.replace(/[^0-9.]/g, "")) || 0;
  const balance = Math.max(0, price - paidTotal);
  const signed = agreements.filter((a) => a.email.toLowerCase() === portal.email.toLowerCase());
  const done = portal.steps.filter((s) => s.done).length;
  const pct = portal.steps.length ? Math.round((done / portal.steps.length) * 100) : 0;
  const current = portal.steps.find((s) => !s.done);

  return (
    <div className="portal">
      <header className="portal-top">
        <a href="/" className="portal-brand"><Logo id="jf-logo-portal" /> <span>Jaider Feliciana</span></a>
        <div className="portal-who">
          <span>{client.name}</span>
          <form action={portalLogout}><button type="submit" className="link-button">Log out</button></form>
        </div>
      </header>

      <main className="container portal-main">
        <section className="portal-hero">
          <p className="eyebrow">Client portal</p>
          <h1>Hi {client.name.split(" ")[0]}, here&apos;s your project.</h1>
          <p>{client.business ? `${client.business} · ` : ""}{client.service || "Your project"}</p>
        </section>

        <section className="portal-card progress-card">
          <div className="portal-card-head">
            <h2>Progress</h2>
            <strong className="pct">{pct}%</strong>
          </div>
          <div className="progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div>
          <p className="progress-now">{current ? <>Now: <strong>{current.name}</strong></> : <strong>All steps done 🎉</strong>}</p>
          <ol className="steps">
            {portal.steps.map((s, i) => (
              <li key={i} className={s.done ? "is-done" : s === current ? "is-current" : undefined}>
                <span className="step-dot">{s.done ? "✓" : i + 1}</span>{s.name}
              </li>
            ))}
          </ol>
        </section>

        <div className="portal-grid">
          <section className="portal-card">
            <h2>Payments</h2>
            <dl className="money-rows">
              <dt>Agreed price</dt><dd>{price ? money(price) : "—"}</dd>
              <dt>Paid</dt><dd>{money(paidTotal)}</dd>
              <dt>Balance</dt><dd className={balance ? "due" : "clear"}>{price ? money(balance) : "—"}</dd>
            </dl>
            {paid.length > 0 && (
              <ul className="paid-list">
                {paid.map((p) => <li key={p.id}><span>{shortDate(p.date)} {p.date.slice(0, 4)}{p.description ? ` · ${p.description}` : ""}</span><strong>{money(p.amount)}</strong></li>)}
              </ul>
            )}
            {balance > 0 && portal.paymentInfo && (
              <div className="pay-info"><p className="eyebrow">How to pay</p><p>{portal.paymentInfo}</p></div>
            )}
          </section>

          <section className="portal-card">
            <h2>Documents</h2>
            <ul className="doc-list">
              {signed.map((a) => (
                <li key={a.id}>
                  <a href={`/agreement/signed/${a.id}`} target="_blank" rel="noopener">Service agreement · {a.service}</a>
                  <span className={a.provider ? "tag tag-ok" : "tag"}>{a.provider ? "Signed by both" : "Awaiting Jaider's signature"}</span>
                </li>
              ))}
              {portal.links.map((l) => (
                <li key={l.id}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a></li>
              ))}
              {signed.length === 0 && portal.links.length === 0 && <li className="muted">Documents and links will appear here.</li>}
            </ul>
          </section>
        </div>

        <section className="portal-card">
          <h2>Messages & files</h2>
          <ul className="thread">
            {portal.messages.length === 0 && <li className="muted">No messages yet. Send Jaider your logo, photos, texts or feedback here.</li>}
            {portal.messages.map((m) => (
              <li key={m.id} className={m.from === "client" ? "from-client" : "from-jaider"}>
                <p className="thread-meta">{m.from === "client" ? "You" : "Jaider"} · {dateTime(m.at)}</p>
                {m.text && <p className="thread-text">{m.text}</p>}
                {m.files.length > 0 && (
                  <ul className="thread-files">
                    {m.files.map((f) => <li key={f.path}><a href={fileUrl(f.path)} target="_blank" rel="noopener">📎 {f.name}</a> <span>{kb(f.size)}</span></li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <Composer uploads={isFilesConfigured()} />
        </section>

        <p className="portal-foot">Questions? <a href={whatsappHref(`Hi Jaider! A question about my project (${client.name}).`)} target="_blank" rel="noopener">WhatsApp Jaider</a></p>
      </main>
    </div>
  );
}
