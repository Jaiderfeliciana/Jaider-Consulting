import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/admin/Bits";
import InvoiceDocument from "@/components/InvoiceDocument";
import PrintButton from "@/components/PrintButton";
import ConfirmButton from "@/components/admin/ConfirmButton";
import CopyLink from "@/components/admin/CopyLink";
import { markInvoicePaid, markInvoiceSent, removeInvoice, undoInvoicePaid } from "@/app/admin/invoice-actions";
import { getClients, isDbConfigured } from "@/lib/admin/data";
import { displayStatus, getInvoice, getInvoiceSettings, invoiceTotals } from "@/lib/admin/invoices";
import { dayKey, money } from "@/lib/admin/dates";
import { contact, phoneDisplay } from "@/content/site";

export default async function InvoiceView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDbConfigured()) notFound();
  const [inv, settings, clients] = await Promise.all([getInvoice(id), getInvoiceSettings({ email: contact.email, phone: phoneDisplay }), getClients()]);
  if (!inv) notFound();
  const h = await headers();
  const link = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host") ?? "www.jaiderfeliciana.com"}/invoice/${inv.id}`;
  const total = money(invoiceTotals(inv).total);
  const status = displayStatus(inv);
  const client = clients.find((c) => c.id === inv.clientId);
  const phone = client?.contact.replace(/[^\d]/g, "") ?? "";
  const waText = `Hi! Here is invoice ${inv.number} for ${total}, due ${inv.dueDate}. You can view and download it here: ${link}`;
  const waHref = `https://wa.me/${phone.length >= 7 && !/@/.test(client?.contact ?? "") ? phone : ""}?text=${encodeURIComponent(waText)}`;
  const hidden = <input type="hidden" name="id" value={inv.id} />;

  return (
    <>
      <PageHead icon="file" title={inv.number} sub={`${inv.clientName} · ${total}`}
        action={<Link href="/admin/invoices" className="a-btn a-btn-ghost">← All invoices</Link>} />
      <div className="card no-print inv-actions">
        <div className="inv-actions-row">
          {inv.status === "draft" && <form action={markInvoiceSent}>{hidden}<button className="a-btn a-btn-primary">Mark as sent</button></form>}
          {inv.status !== "paid" && (
            <form action={markInvoicePaid} className="inline-form">
              {hidden}
              <input type="date" name="paidDate" defaultValue={dayKey()} aria-label="Date paid" />
              <button className="a-btn a-btn-primary">Mark as paid</button>
            </form>
          )}
          {inv.status === "paid" && <form action={undoInvoicePaid}>{hidden}<button className="a-btn a-btn-ghost">Undo paid</button></form>}
          {inv.status !== "paid" && <Link href={`/admin/invoices/${inv.id}/edit`} className="a-btn a-btn-ghost">Edit</Link>}
          <PrintButton className="a-btn a-btn-ghost" />
        </div>
        <div className="inv-actions-row">
          <a href={waHref} target="_blank" rel="noopener" className="a-btn a-btn-ghost">Send on WhatsApp</a>
          <CopyLink link={link} />
          <a href={link} target="_blank" rel="noopener" className="a-btn a-btn-ghost">Client view ↗</a>
        </div>
        <p className="muted inv-hint">
          {status === "draft" ? "Clients can't open the link while the invoice is a draft. Mark it as sent first."
            : status === "paid" ? `Paid on ${inv.paidAt}. The payment is in Finance & Payments.`
            : status === "overdue" ? "This invoice is past its due date." : "Sent. Mark it as paid when the money arrives; it's then added to Finance & Payments."}
        </p>
      </div>
      <InvoiceDocument invoice={inv} settings={settings} />
      <div className="card no-print">
        <form action={removeInvoice}>{hidden}<ConfirmButton message={`Delete invoice ${inv.number}?${inv.paymentId ? " Its payment in Finance & Payments is removed too." : ""}`}>Delete invoice</ConfirmButton></form>
      </div>
    </>
  );
}
