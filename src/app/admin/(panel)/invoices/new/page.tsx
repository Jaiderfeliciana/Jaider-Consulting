import { NotConnected, PageHead } from "@/components/admin/Bits";
import InvoiceForm from "@/components/admin/InvoiceForm";
import { getClients, isDbConfigured } from "@/lib/admin/data";
import { getInvoiceSettings } from "@/lib/admin/invoices";
import { clientOptions, quickItems } from "@/lib/admin/invoice-helpers";
import { dayKey } from "@/lib/admin/dates";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  if (!isDbConfigured()) return <><PageHead icon="file" title="New invoice" /><NotConnected what="The database" /></>;
  const { client: preselect } = await searchParams;
  const [clients, settings] = await Promise.all([getClients(), getInvoiceSettings()]);
  const options = clientOptions(clients);
  const chosen = options.find((c) => c.id === preselect);
  const today = dayKey();
  const due = new Date(`${today}T12:00:00Z`);
  due.setUTCDate(due.getUTCDate() + settings.paymentTermsDays);
  return (
    <>
      <PageHead icon="file" title="New invoice" sub="The invoice number is given when you save." />
      <InvoiceForm clients={options} quickItems={quickItems()} initial={{
        clientId: chosen?.id ?? "", clientName: chosen?.label ?? "", clientEmail: chosen?.email ?? "", clientAddress: "",
        issueDate: today, dueDate: due.toISOString().slice(0, 10), taxRate: settings.defaultTaxRate, notes: "", items: [],
      }} />
    </>
  );
}
