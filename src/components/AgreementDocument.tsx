import { agreement } from "@/content/agreement";
import type { Agreement } from "@/lib/admin/data";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short", timeZone: "America/Aruba" }) + " (Aruba time)";

// The agreement as a document. Without `signed`, only the terms are shown (for the signing page).
export default function AgreementDocument({ signed, signatures }: {
  signed?: Agreement;
  signatures?: { client: string | null; provider: string | null };
}) {
  return (
    <article className="agreement-doc">
      <header className="doc-head">
        <p className="doc-brand">JAIDER FELICIANA</p>
        <h1>{agreement.title}</h1>
        <p className="doc-site">Website: <a href="https://www.jaiderfeliciana.com">www.jaiderfeliciana.com</a></p>
      </header>
      <p>{agreement.intro}</p>
      <ol className="doc-terms">
        {agreement.sections.map((s) => (
          <li key={s.title}>
            <h2>{s.title}</h2>
            {s.text && <p>{s.text}</p>}
            {s.bullets && <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
          </li>
        ))}
      </ol>
      <p className="doc-law">{agreement.law}</p>

      {signed && (
        <>
          <section className="doc-block">
            <h2>Client information</h2>
            <dl>
              <dt>Full name</dt><dd>{signed.fullName}</dd>
              <dt>Company name</dt><dd>{signed.company || "—"}</dd>
              <dt>Email</dt><dd>{signed.email}</dd>
              <dt>Service purchased</dt><dd>{signed.service}</dd>
              <dt>Agreed price</dt><dd>USD ${signed.price}</dd>
            </dl>
          </section>
          <section className="doc-signatures">
            <div>
              <h2>Client signature</h2>
              {signatures?.client ? <img src={signatures.client} alt={`Signature of ${signed.fullName}`} /> : <p className="doc-missing">Not signed</p>}
              <p>{signed.fullName}</p>
              <p className="doc-date">Date: {when(signed.signedAt)}</p>
            </div>
            <div>
              <h2>Jaider Feliciana</h2>
              {signed.provider && signatures?.provider
                ? <img src={signatures.provider} alt={`Signature of ${signed.provider.name}`} />
                : <p className="doc-missing">Awaiting signature</p>}
              <p>Authorized representative: {signed.provider?.name ?? "—"}</p>
              {signed.provider && <p className="doc-date">Date: {when(signed.provider.signedAt)}</p>}
            </div>
          </section>
          <p className="doc-meta">Agreement {signed.id.slice(0, 8).toUpperCase()} · terms version {signed.version}</p>
        </>
      )}
      <p className="doc-tagline">{agreement.tagline}</p>
    </article>
  );
}
