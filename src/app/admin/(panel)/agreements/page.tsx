import Link from "next/link";
import { headers } from "next/headers";
import { NotConnected, PageHead } from "@/components/admin/Bits";
import LinkMaker from "@/components/admin/LinkMaker";
import { getAgreements } from "@/lib/admin/data";
import { fromDb } from "@/lib/admin/load";
import { dateTime } from "@/lib/admin/dates";
import { contactTopics } from "@/content/site";

export default async function AgreementsPage() {
  const list = await fromDb(getAgreements);
  const h = await headers();
  const base = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host") ?? "www.jaiderfeliciana.com"}`;
  return (
    <>
      <PageHead icon="folder" title="Agreements" sub="Clients sign your service agreement online; you countersign it here." />
      <div className="card">
        <h2>Send an agreement</h2>
        <p className="muted lm-intro">Choose the service and price, then send the link. The client fills in their details and signs.</p>
        <LinkMaker services={contactTopics} base={base} />
      </div>
      <div className="card">
        <h2>Signed agreements</h2>
        {!("data" in list) ? <NotConnected what="The database" error={"error" in list ? list.error : undefined} />
          : list.data.length === 0 ? <p className="muted">No agreements signed yet.</p> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Client</th><th>Service</th><th className="num">Price</th><th>Signed</th><th>Status</th><th /></tr></thead>
                <tbody>
                  {list.data.map((a) => (
                    <tr key={a.id}>
                      <td><strong>{a.fullName}</strong><br /><span className="muted">{a.company || a.email}</span></td>
                      <td>{a.service}</td>
                      <td className="num">${a.price}</td>
                      <td>{dateTime(a.signedAt)}</td>
                      <td><span className={`pill ${a.provider ? "pill-on" : "pill-lead"}`}>{a.provider ? "Signed by both" : "Needs your signature"}</span></td>
                      <td className="num"><Link href={`/admin/agreements/${a.id}`} className="a-btn a-btn-small">{a.provider ? "View" : "Countersign"}</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </>
  );
}
