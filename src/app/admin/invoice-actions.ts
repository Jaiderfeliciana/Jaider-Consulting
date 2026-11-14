"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { deletePayment, getClients, savePayment } from "@/lib/admin/data";
import { dayKey } from "@/lib/admin/dates";
import {
  deleteInvoice, getInvoice, getInvoiceSettings, invoiceTotals, nextInvoiceNumber, saveInvoice, saveInvoiceSettings,
  type Invoice, type InvoiceItem,
} from "@/lib/admin/invoices";

type State = { error: string; message?: string };
const text = (form: FormData, key: string, max = 300) => String(form.get(key) ?? "").trim().slice(0, max);
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const num = (s: string) => Number(s.replace(",", ".").replace(/[^0-9.]/g, ""));

function parseItems(raw: string): InvoiceItem[] {
  let rows: unknown;
  try { rows = JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(rows)) return [];
  return rows.slice(0, 50).map((r) => ({
    description: String((r as InvoiceItem).description ?? "").trim().slice(0, 200),
    qty: Math.max(0, num(String((r as InvoiceItem).qty ?? ""))),
    price: Math.round(num(String((r as InvoiceItem).price ?? "")) * 100) / 100,
  })).filter((i) => i.description && i.qty > 0);
}

// Creates or updates an invoice from the invoice form.
export async function saveInvoiceForm(_prev: State, form: FormData): Promise<State> {
  await requireAdmin();
  const id = text(form, "id", 64);
  const existing = id ? await getInvoice(id) : null;
  if (id && !existing) return { error: "This invoice no longer exists." };
  if (existing?.status === "paid") return { error: "Paid invoices can't be changed. Undo 'paid' first." };

  const clientId = text(form, "clientId", 64);
  const client = clientId ? (await getClients()).find((c) => c.id === clientId) : undefined;
  const clientName = text(form, "clientName", 120) || client?.business || client?.name || "";
  const issueDate = text(form, "issueDate", 10);
  const dueDate = text(form, "dueDate", 10);
  const items = parseItems(String(form.get("items") ?? "[]"));
  const taxRate = Math.min(100, Math.max(0, num(text(form, "taxRate", 10)) || 0));

  if (!clientName) return { error: "Choose a client or type the client's name." };
  if (!isDate(issueDate) || !isDate(dueDate)) return { error: "Enter an invoice date and a due date." };
  if (dueDate < issueDate) return { error: "The due date can't be before the invoice date." };
  if (items.length === 0) return { error: "Add at least one line with a description, quantity and price." };
  if (invoiceTotals({ items, taxRate }).total <= 0) return { error: "The invoice total must be more than $0." };

  const invoice: Invoice = {
    id: existing?.id ?? randomUUID(),
    number: existing?.number ?? (await nextInvoiceNumber(issueDate)),
    clientId: client?.id ?? "",
    clientName,
    clientEmail: text(form, "clientEmail", 160),
    clientAddress: text(form, "clientAddress", 300),
    issueDate, dueDate, items, taxRate,
    notes: text(form, "notes", 1000),
    status: existing?.status ?? "draft",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  await saveInvoice(invoice);
  revalidatePath("/admin", "layout");
  redirect(`/admin/invoices/${invoice.id}`);
}

async function load(form: FormData) {
  await requireAdmin();
  const inv = await getInvoice(text(form, "id", 64));
  if (!inv) redirect("/admin/invoices");
  return inv;
}

export async function markInvoiceSent(form: FormData) {
  const inv = await load(form);
  if (inv.status === "draft") await saveInvoice({ ...inv, status: "sent" });
  revalidatePath("/admin", "layout");
}

// Paid: also records the payment in Finance & Payments, so revenue stays in sync.
export async function markInvoicePaid(form: FormData) {
  const inv = await load(form);
  if (inv.status === "paid") return;
  const date = isDate(text(form, "paidDate", 10)) ? text(form, "paidDate", 10) : dayKey();
  const paymentId = randomUUID();
  // Record it under the client's own name so the client's "Paid" total adds up on the dashboard.
  const client = inv.clientId ? (await getClients()).find((c) => c.id === inv.clientId) : undefined;
  await savePayment({
    id: paymentId, client: client?.name ?? inv.clientName, description: `Invoice ${inv.number}`,
    amount: invoiceTotals(inv).total, date, createdAt: new Date().toISOString(),
  });
  await saveInvoice({ ...inv, status: "paid", paidAt: date, paymentId });
  revalidatePath("/admin", "layout");
}

export async function undoInvoicePaid(form: FormData) {
  const inv = await load(form);
  if (inv.status !== "paid") return;
  if (inv.paymentId) await deletePayment(inv.paymentId);
  await saveInvoice({ ...inv, status: "sent", paidAt: undefined, paymentId: undefined });
  revalidatePath("/admin", "layout");
}

export async function removeInvoice(form: FormData) {
  const inv = await load(form);
  if (inv.paymentId) await deletePayment(inv.paymentId);
  await deleteInvoice(inv.id);
  revalidatePath("/admin", "layout");
  redirect("/admin/invoices");
}

export async function saveInvoiceSettingsForm(_prev: State, form: FormData): Promise<State> {
  await requireAdmin();
  const current = await getInvoiceSettings();
  await saveInvoiceSettings({
    businessName: text(form, "businessName", 120) || current.businessName,
    address: text(form, "address", 300),
    email: text(form, "email", 160),
    phone: text(form, "phone", 60),
    taxId: text(form, "taxId", 60),
    defaultTaxRate: Math.min(100, Math.max(0, num(text(form, "defaultTaxRate", 10)) || 0)),
    paymentTermsDays: Math.min(120, Math.max(0, Math.round(num(text(form, "paymentTermsDays", 5)) || 0))),
    paymentInstructions: text(form, "paymentInstructions", 1000),
  });
  revalidatePath("/admin", "layout");
  return { error: "", message: "Invoice settings saved." };
}
