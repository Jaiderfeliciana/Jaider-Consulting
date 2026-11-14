import Link from "next/link";
import { NotConnected, PageHead, Stat } from "@/components/admin/Bits";
import InvoiceSettingsForm from "@/components/admin/InvoiceSettingsForm";
import Collapsible from "@/components/admin/Collapsible";
import { fromDb } from "@/lib/admin/load";
import { displayStatus, getInvoiceSettings, getInvoices, invoiceTotals } from "@/lib/admin/invoices";
import { monthKey, money, shortDate } from "@/lib/admin/dates";
import { contact, phoneDisplay } from "@/content/site";

const LABEL: Record<string, string> = { draft: "Draft", sent: "Sent", overdue: "Overdue", paid: "Paid" };

export default async function InvoicesPage() {
  const res = await fromDb(() => Promise.all([getInvoices(), getInvoiceSettings({ email: contact.email, phone: phoneDisplay })]));
  if (!("data" in res)) {
    return <><PageHead icon="file" title="Invoices" /><NotConnected what="The database" error={"error" in res ? res.error : undefined} /></>;
  }
  const [invoices, settings] = res.data;
  const rows = invoices.map((inv) => ({ inv, status: displayStatus(inv), total: invoiceTotals(inv).total }));
  const sum = (list: typeof rows) => list.reduce((s, r) => s + r.total, 0);
  const open = rows.filter((r) => r.status === "sent" || r.status === "overdue");
  const overdue = rows.filter((r) => r.status === "overdue");
  const paidThisMonth = rows.filter((r) => r.status === "paid" && (r.inv.paidAt ?? "").startsWith(monthKey()));

  return (
    <>
      <PageHead icon="file" title="Invoices" sub="Create, send and track invoices. Paid invoices are added to Finance & Payments."
        action={<Link href="/admin/invoices/new" className="a-btn a-btn-primary">+ New invoice</Link>} />
      <section className="stats-row">
        <Stat dark label="Outstanding" value={money(sum(open))} note={`${open.length} invoice${open.length === 1 ? "" : "s"} sent, not paid`} />
        <Stat label="Overdue" value={money(sum(overdue))} note={`${overdue.length} past the due date`} />
        <Stat label="Paid this month" value={money(sum(paidThisMonth))} note={`${paidThisMonth.length} invoice${paidThisMonth.length === 1 ? "" : "s"}`} />
        <Stat label="Drafts" value={String(rows.filter((r) => r.status === "draft").length)} note="not sent yet" />
      </section>

      <div className="card">
        <h2>All invoices</h2>
        {rows.length === 0 ? <p className="muted">No invoices yet. <Link href="/admin/invoices/new" className="a-link">Create your first invoice →</Link></p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Number</th><th>Client</th><th>Date</th><th>Due</th><th className="num">Total</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map(({ inv, status, total }) => (
                  <tr key={inv.id}>
                    <td><Link href={`/admin/invoices/${inv.id}`} className="inv-link">{inv.number}</Link></td>
                    <td>{inv.clientName}</td>
                    <td>{shortDate(inv.issueDate)}</td>
                    <td>{shortDate(inv.dueDate)}</td>
                    <td className="num">{money(total)}</td>
                    <td><span className={`pill pill-inv-${status}`}>{LABEL[status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Collapsible className="card inv-settings-card" initiallyOpen={!settings.paymentInstructions}
        summary={<>Invoice settings{!settings.paymentInstructions && " · add how clients can pay you"}</>}>
        <p className="muted">These appear on every invoice. They&apos;re stored privately in your database.</p>
        <InvoiceSettingsForm settings={settings} />
      </Collapsible>
    </>
  );
}
