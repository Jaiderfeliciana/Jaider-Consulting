import Logo from "@/components/Logo";
import type { Invoice, InvoiceSettings } from "@/lib/admin/invoices";
import { displayStatus, invoiceTotals } from "@/lib/admin/invoices";

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const longDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" });
const STATUS: Record<string, string> = { draft: "Draft", sent: "Due", overdue: "Overdue", paid: "Paid" };

// A printable invoice in the brand style. Used in the admin panel and on the client's private link.
export default function InvoiceDocument({ invoice, settings }: { invoice: Invoice; settings: InvoiceSettings }) {
  const { subtotal, tax, total } = invoiceTotals(invoice);
  const status = displayStatus(invoice);
  return (
    <article className="invoice-doc">
      <header className="inv-head">
        <div className="inv-brand">
          <Logo id={`jf-logo-inv-${invoice.id.slice(0, 6)}`} />
          <div>
            <p className="inv-business">{settings.businessName}</p>
            <p className="inv-small">
              {[settings.address, settings.email, settings.phone, "www.jaiderfeliciana.com"].filter(Boolean).join(" · ")}
            </p>
            {settings.taxId && <p className="inv-small">Tax / registration no.: {settings.taxId}</p>}
          </div>
        </div>
        <div className="inv-title">
          <h1>Invoice</h1>
          <p className="inv-number">{invoice.number}</p>
          <span className={`inv-status inv-${status}`}>{STATUS[status]}</span>
        </div>
      </header>

      <section className="inv-meta">
        <div>
          <p className="inv-label">Bill to</p>
          <p className="inv-strong">{invoice.clientName}</p>
          {invoice.clientAddress && <p className="inv-pre">{invoice.clientAddress}</p>}
          {invoice.clientEmail && <p>{invoice.clientEmail}</p>}
        </div>
        <dl>
          <dt>Invoice date</dt><dd>{longDate(invoice.issueDate)}</dd>
          <dt>Due date</dt><dd>{longDate(invoice.dueDate)}</dd>
          {invoice.paidAt && <><dt>Paid on</dt><dd>{longDate(invoice.paidAt)}</dd></>}
        </dl>
      </section>

      <table className="inv-table">
        <thead><tr><th>Description</th><th className="num">Qty</th><th className="num">Price</th><th className="num">Amount</th></tr></thead>
        <tbody>
          {invoice.items.map((it, i) => (
            <tr key={i}>
              <td>{it.description}</td>
              <td className="num">{it.qty}</td>
              <td className="num">{usd(it.price)}</td>
              <td className="num">{usd(Math.round(it.qty * it.price * 100) / 100)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="inv-totals">
        <dt>Subtotal</dt><dd>{usd(subtotal)}</dd>
        {invoice.taxRate > 0 && <><dt>Tax ({invoice.taxRate}%)</dt><dd>{usd(tax)}</dd></>}
        <dt className="inv-total">Total (USD)</dt><dd className="inv-total">{usd(total)}</dd>
      </dl>

      {(settings.paymentInstructions && status !== "paid") || invoice.notes ? (
        <section className="inv-notes">
          {settings.paymentInstructions && status !== "paid" && (
            <div><p className="inv-label">How to pay</p><p className="inv-pre">{settings.paymentInstructions}</p></div>
          )}
          {invoice.notes && <div><p className="inv-label">Notes</p><p className="inv-pre">{invoice.notes}</p></div>}
        </section>
      ) : null}
      <p className="inv-thanks">Thank you for your business! · Your Success Is Online.</p>
    </article>
  );
}
