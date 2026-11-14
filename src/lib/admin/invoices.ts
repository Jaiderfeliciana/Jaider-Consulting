import "server-only";
import { command, pipeline } from "./db";
import { dayKey } from "./dates";

export type InvoiceItem = { description: string; qty: number; price: number };
export type InvoiceStatus = "draft" | "sent" | "paid";
export type Invoice = {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
  taxRate: number; // percent
  notes: string;
  status: InvoiceStatus;
  paidAt?: string;
  paymentId?: string; // the matching entry in Finance & Payments
  createdAt: string;
};

// Your details as they appear on every invoice. Saved in the database (not in the code),
// because bank details shouldn't be in the public repository.
export type InvoiceSettings = {
  businessName: string;
  address: string;
  email: string;
  phone: string;
  taxId: string;
  defaultTaxRate: number;
  paymentTermsDays: number;
  paymentInstructions: string;
};

const INVOICES = "jf:invoices";
const SETTINGS = "jf:settings:invoice";

// Amounts are added up in cents so totals never show rounding errors.
const cents = (n: number) => Math.round(n * 100);
export function invoiceTotals(inv: Pick<Invoice, "items" | "taxRate">) {
  const subtotal = inv.items.reduce((s, i) => s + Math.round(i.qty * cents(i.price)), 0);
  const tax = Math.round((subtotal * inv.taxRate) / 100);
  return { subtotal: subtotal / 100, tax: tax / 100, total: (subtotal + tax) / 100 };
}

// What the client sees: paid, sent, overdue (sent and past the due date) or draft.
export function displayStatus(inv: Invoice) {
  if (inv.status === "sent" && inv.dueDate < dayKey()) return "overdue";
  return inv.status;
}

export async function getInvoices() {
  const flat = ((await command("HGETALL", INVOICES)) as string[] | null) ?? [];
  const list: Invoice[] = [];
  for (let i = 1; i < flat.length; i += 2) {
    try { list.push(JSON.parse(flat[i]) as Invoice); } catch { /* skip damaged entry */ }
  }
  return list.sort((a, b) => b.number.localeCompare(a.number));
}

export async function getInvoice(id: string) {
  const raw = (await command("HGET", INVOICES, id)) as string | null;
  return raw ? (JSON.parse(raw) as Invoice) : null;
}

export async function saveInvoice(inv: Invoice) {
  await command("HSET", INVOICES, inv.id, JSON.stringify(inv));
}

export async function deleteInvoice(id: string) {
  await command("HDEL", INVOICES, id);
}

// Next number for the year: JF-2026-0001, JF-2026-0002, ...
export async function nextInvoiceNumber(issueDate: string) {
  const year = issueDate.slice(0, 4);
  const [n] = (await pipeline([["INCR", `jf:invoice-seq:${year}`]])) as [number];
  return `JF-${year}-${String(n).padStart(4, "0")}`;
}

export async function getInvoiceSettings(fallback: Partial<InvoiceSettings> = {}): Promise<InvoiceSettings> {
  const raw = (await command("GET", SETTINGS)) as string | null;
  const saved = raw ? (JSON.parse(raw) as Partial<InvoiceSettings>) : {};
  return {
    businessName: "Jaider Feliciana",
    address: "Oranjestad, Aruba",
    email: "",
    phone: "",
    taxId: "",
    defaultTaxRate: 0,
    paymentTermsDays: 14,
    paymentInstructions: "",
    ...fallback,
    ...saved,
  };
}

export async function saveInvoiceSettings(s: InvoiceSettings) {
  await command("SET", SETTINGS, JSON.stringify(s));
}
