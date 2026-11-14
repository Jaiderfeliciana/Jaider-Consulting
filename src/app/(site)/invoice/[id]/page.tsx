import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InvoiceDocument from "@/components/InvoiceDocument";
import PrintButton from "@/components/PrintButton";
import { isDbConfigured } from "@/lib/admin/data";
import { getInvoice, getInvoiceSettings } from "@/lib/admin/invoices";
import { contact, phoneDisplay, whatsappHref } from "@/content/site";

export const metadata: Metadata = { title: "Invoice — Jaider Feliciana", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// The client's copy of an invoice. The link holds a long random id; drafts can't be opened.
export default async function ClientInvoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDbConfigured() || !/^[0-9a-f-]{36}$/.test(id)) notFound();
  const inv = await getInvoice(id);
  if (!inv || inv.status === "draft") notFound();
  const settings = await getInvoiceSettings({ email: contact.email, phone: phoneDisplay });
  return (
    <main className="section invoice-page">
      <div className="container invoice-wrap">
        <div className="invoice-tools no-print">
          <PrintButton label="Print or save as PDF" />
          <a className="btn btn-ghost" href={whatsappHref(`Hi Jaider! A question about invoice ${inv.number}.`)} target="_blank" rel="noopener">Questions? WhatsApp</a>
        </div>
        <InvoiceDocument invoice={inv} settings={settings} />
      </div>
    </main>
  );
}
