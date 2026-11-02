import "server-only";
import { command, isDbConfigured, pipeline } from "./db";
import { lastDays, monthKey } from "./dates";
import type { ClientStatus } from "./config";

export type Client = {
  id: string;
  name: string;
  business: string;
  contact: string;
  links: string;
  service: string;
  status: ClientStatus;
  notes: string;
  createdAt: string;
};

export type Payment = {
  id: string;
  client: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  createdAt: string;
};

const CLIENTS = "jf:clients";
const PAYMENTS = "jf:payments";

async function readHash<T>(key: string): Promise<T[]> {
  const flat = ((await command("HGETALL", key)) as string[] | null) ?? [];
  const items: T[] = [];
  for (let i = 1; i < flat.length; i += 2) {
    try { items.push(JSON.parse(flat[i]) as T); } catch { /* skip damaged entry */ }
  }
  return items;
}

export async function getClients() {
  return (await readHash<Client>(CLIENTS)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveClient(client: Client) {
  await command("HSET", CLIENTS, client.id, JSON.stringify(client));
}

export async function deleteClient(id: string) {
  await command("HDEL", CLIENTS, id);
}

export async function getPayments() {
  return (await readHash<Payment>(PAYMENTS)).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export async function savePayment(payment: Payment) {
  await command("HSET", PAYMENTS, payment.id, JSON.stringify(payment));
}

export async function deletePayment(id: string) {
  await command("HDEL", PAYMENTS, id);
}

// ---------- website visitors ----------

// Only these pages are counted; anything else is grouped as "Other".
export const TRACKED_PAGES: Record<string, string> = { "/": "Home", "/book": "Booking planner" };

export async function recordVisit(path: string, newVisitor: boolean) {
  const page = path in TRACKED_PAGES ? path : "other";
  const day = lastDays(1)[0];
  const keep = 60 * 60 * 24 * 400;
  const cmds: (string | number)[][] = [
    ["INCR", `jf:pv:${day}`], ["EXPIRE", `jf:pv:${day}`, keep],
    ["HINCRBY", `jf:pages:${monthKey()}`, page, 1], ["EXPIRE", `jf:pages:${monthKey()}`, keep],
  ];
  if (newVisitor) cmds.push(["INCR", `jf:uv:${day}`], ["EXPIRE", `jf:uv:${day}`, keep]);
  await pipeline(cmds);
}

export async function getVisits(days: number) {
  const keys = lastDays(days);
  const [views, visitors, pages] = await pipeline([
    ["MGET", ...keys.map((d) => `jf:pv:${d}`)],
    ["MGET", ...keys.map((d) => `jf:uv:${d}`)],
    ["HGETALL", `jf:pages:${monthKey()}`],
  ]) as [(string | null)[], (string | null)[], string[] | null];
  const flat = pages ?? [];
  const topPages = [];
  for (let i = 0; i < flat.length; i += 2) {
    topPages.push({ page: TRACKED_PAGES[flat[i]] ?? "Other", views: Number(flat[i + 1]) });
  }
  return {
    days: keys.map((day, i) => ({ day, views: Number(views[i] ?? 0), visitors: Number(visitors[i] ?? 0) })),
    topPages: topPages.sort((a, b) => b.views - a.views),
  };
}

export { isDbConfigured };
