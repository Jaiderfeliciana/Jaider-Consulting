import { notFound, redirect } from "next/navigation";
import { PageHead } from "@/components/admin/Bits";
import InvoiceForm from "@/components/admin/InvoiceForm";
import { getClients, isDbConfigured } from "@/lib/admin/data";
import { getInvoice } from "@/lib/admin/invoices";
import { clientOptions, quickItems } from "@/lib/admin/invoice-helpers";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDbConfigured()) notFound();
  const [inv, clients] = await Promise.all([getInvoice(id), getClients()]);
  if (!inv) notFound();
  if (inv.status === "paid") redirect(`/admin/invoices/${id}`);
  return (
    <>
      <PageHead icon="file" title={`Edit ${inv.number}`} sub={inv.clientName} />
      <InvoiceForm clients={clientOptions(clients)} quickItems={quickItems()} initial={{
        id: inv.id, clientId: inv.clientId, clientName: inv.clientName, clientEmail: inv.clientEmail, clientAddress: inv.clientAddress,
        issueDate: inv.issueDate, dueDate: inv.dueDate, taxRate: inv.taxRate, notes: inv.notes,
        items: inv.items.map((i) => ({ description: i.description, qty: String(i.qty), price: i.price.toFixed(2) })),
      }} />
    </>
  );
}
