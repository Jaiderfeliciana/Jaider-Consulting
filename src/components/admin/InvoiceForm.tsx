"use client";

import { startTransition, useActionState, useState } from "react";
import { saveInvoiceForm } from "@/app/admin/invoice-actions";

type Row = { description: string; qty: string; price: string };
type ClientOption = { id: string; label: string; email: string };

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const toNum = (s: string) => Number(s.replace(",", ".").replace(/[^0-9.]/g, "")) || 0;

// Create or edit an invoice. Lines and totals update as you type.
export default function InvoiceForm({ clients, initial, quickItems }: {
  clients: ClientOption[];
  quickItems: { description: string; price: number }[];
  initial: {
    id?: string; clientId: string; clientName: string; clientEmail: string; clientAddress: string;
    issueDate: string; dueDate: string; taxRate: number; notes: string; items: Row[];
  };
}) {
  const [state, action, pending] = useActionState(saveInvoiceForm, { error: "" });
  const [rows, setRows] = useState<Row[]>(initial.items.length ? initial.items : [{ description: "", qty: "1", price: "" }]);
  const [clientId, setClientId] = useState(initial.clientId);
  const [clientName, setClientName] = useState(initial.clientName);
  const [clientEmail, setClientEmail] = useState(initial.clientEmail);
  const [taxRate, setTaxRate] = useState(String(initial.taxRate));

  const subtotal = rows.reduce((s, r) => s + Math.round(toNum(r.qty) * Math.round(toNum(r.price) * 100)), 0) / 100;
  const tax = Math.round(subtotal * toNum(taxRate)) / 100;
  const update = (i: number, patch: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <form
      className="a-form invoice-form"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        data.set("items", JSON.stringify(rows));
        startTransition(() => action(data));
      }}
    >
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="card">
        <h2>Client</h2>
        <div className="inv-grid">
          <label>Client
            <select name="clientId" value={clientId} onChange={(e) => {
              const c = clients.find((x) => x.id === e.target.value);
              setClientId(e.target.value);
              if (c) { setClientName(c.label); if (c.email) setClientEmail(c.email); }
            }}>
              <option value="">— Not in my client list —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </label>
          <label>Bill to (name on the invoice)<input name="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required placeholder="Maria's Bakery" /></label>
          <label>Client email<input name="clientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Optional" /></label>
          <label>Client address<textarea name="clientAddress" rows={2} defaultValue={initial.clientAddress} placeholder="Optional" /></label>
        </div>
      </div>

      <div className="card">
        <h2>Lines</h2>
        <div className="inv-lines">
          <div className="inv-line inv-line-head" aria-hidden="true"><span>Description</span><span>Qty</span><span>Price (USD)</span><span>Amount</span><span /></div>
          {rows.map((r, i) => (
            <div key={i} className="inv-line">
              <input aria-label={`Line ${i + 1} description`} value={r.description} onChange={(e) => update(i, { description: e.target.value })} placeholder="Website design — 50% deposit" maxLength={200} />
              <input aria-label={`Line ${i + 1} quantity`} value={r.qty} onChange={(e) => update(i, { qty: e.target.value })} inputMode="decimal" />
              <input aria-label={`Line ${i + 1} price`} value={r.price} onChange={(e) => update(i, { price: e.target.value })} inputMode="decimal" placeholder="0.00" />
              <span className="inv-amount">{usd(Math.round(toNum(r.qty) * toNum(r.price) * 100) / 100)}</span>
              <button type="button" className="inv-remove" aria-label={`Remove line ${i + 1}`} onClick={() => setRows(rows.length > 1 ? rows.filter((_, j) => j !== i) : [{ description: "", qty: "1", price: "" }])}>×</button>
            </div>
          ))}
        </div>
        <div className="inv-add">
          <button type="button" className="a-btn a-btn-small" onClick={() => setRows([...rows, { description: "", qty: "1", price: "" }])}>+ Add line</button>
          {quickItems.length > 0 && (
            <select aria-label="Add a service from your price list" value="" onChange={(e) => {
              const q = quickItems[Number(e.target.value)];
              if (!q) return;
              const blank = rows.findIndex((r) => !r.description && !r.price);
              const row = { description: q.description, qty: "1", price: String(q.price) };
              setRows(blank >= 0 ? rows.map((r, j) => (j === blank ? row : r)) : [...rows, row]);
            }}>
              <option value="">+ Add from my services…</option>
              {quickItems.map((q, i) => <option key={q.description} value={i}>{q.description} ({usd(q.price)})</option>)}
            </select>
          )}
        </div>
        <dl className="inv-form-totals">
          <dt>Subtotal</dt><dd>{usd(subtotal)}</dd>
          <dt><label className="inv-tax">Tax %<input name="taxRate" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} inputMode="decimal" /></label></dt><dd>{usd(tax)}</dd>
          <dt className="inv-total">Total</dt><dd className="inv-total">{usd(subtotal + tax)}</dd>
        </dl>
      </div>

      <div className="card">
        <h2>Dates & notes</h2>
        <div className="inv-grid">
          <label>Invoice date<input name="issueDate" type="date" defaultValue={initial.issueDate} required /></label>
          <label>Due date<input name="dueDate" type="date" defaultValue={initial.dueDate} required /></label>
          <label className="span-2">Notes (shown on the invoice)<textarea name="notes" rows={3} defaultValue={initial.notes} placeholder="e.g. 50% deposit for the website project, as agreed in our service agreement." /></label>
        </div>
      </div>

      <div className="inv-submit">
        <button type="submit" className="a-btn a-btn-primary" disabled={pending}>{pending ? "Saving…" : initial.id ? "Save changes" : "Create invoice"}</button>
        <p className="form-error" role="alert">{state.error}</p>
      </div>
    </form>
  );
}
