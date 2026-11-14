"use client";

import { startTransition, useActionState } from "react";
import { saveInvoiceSettingsForm } from "@/app/admin/invoice-actions";
import type { InvoiceSettings } from "@/lib/admin/invoices";

export default function InvoiceSettingsForm({ settings }: { settings: InvoiceSettings }) {
  const [state, action, pending] = useActionState(saveInvoiceSettingsForm, { error: "" });
  return (
    <form className="a-form inv-settings" onSubmit={(e) => { e.preventDefault(); const d = new FormData(e.currentTarget); startTransition(() => action(d)); }}>
      <label>Business name<input name="businessName" defaultValue={settings.businessName} required /></label>
      <label>Tax / registration number<input name="taxId" defaultValue={settings.taxId} placeholder="e.g. your KvK or CRIB number" /></label>
      <label>Email on invoices<input name="email" type="email" defaultValue={settings.email} /></label>
      <label>Phone on invoices<input name="phone" defaultValue={settings.phone} /></label>
      <label className="span-2">Address<input name="address" defaultValue={settings.address} /></label>
      <label>Default tax % (e.g. BBO)<input name="defaultTaxRate" inputMode="decimal" defaultValue={String(settings.defaultTaxRate)} /></label>
      <label>Payment terms (days until due)<input name="paymentTermsDays" inputMode="numeric" defaultValue={String(settings.paymentTermsDays)} /></label>
      <label className="span-2">How to pay (bank details, cash, etc.)
        <textarea name="paymentInstructions" rows={3} defaultValue={settings.paymentInstructions} placeholder="e.g. Bank transfer to Aruba Bank account …, in the name of Jaider Feliciana. Please mention the invoice number." />
      </label>
      <div className="span-2 inv-submit">
        <button type="submit" className="a-btn a-btn-primary" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button>
        <span className="rf-ok" role="status">{state.message}</span>
      </div>
    </form>
  );
}
