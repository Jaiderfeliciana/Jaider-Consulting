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


// ---------- tasks ----------

export type Task = {
  id: string;
  title: string;
  due: string; // YYYY-MM-DD, or "" for no date
  done: boolean;
  createdAt: string;
};

const TASKS = "jf:tasks";

// Open tasks first (soonest due date first, undated last), then finished ones.
export async function getTasks() {
  return (await readHash<Task>(TASKS)).sort((a, b) =>
    Number(a.done) - Number(b.done) || (a.due || "9999").localeCompare(b.due || "9999") || a.createdAt.localeCompare(b.createdAt));
}

export async function saveTask(task: Task) {
  await command("HSET", TASKS, task.id, JSON.stringify(task));
}

export async function deleteTask(id: string) {
  await command("HDEL", TASKS, id);
}


// ---------- agreements ----------

export type Agreement = {
  id: string;
  version: string;
  fullName: string;
  company: string;
  email: string;
  service: string;
  price: string;
  signedAt: string;
  ip: string;
  userAgent: string;
  provider?: { name: string; signedAt: string };
};

const AGREEMENTS = "jf:agreements";
// Signature images are stored separately so the list stays small.
const sigKey = (id: string, who: "client" | "provider") => `jf:sig:${id}:${who}`;

export async function getAgreements() {
  return (await readHash<Agreement>(AGREEMENTS)).sort((a, b) => b.signedAt.localeCompare(a.signedAt));
}

export async function getAgreement(id: string) {
  const [raw, client, provider] = await pipeline([
    ["HGET", AGREEMENTS, id], ["GET", sigKey(id, "client")], ["GET", sigKey(id, "provider")],
  ]) as [string | null, string | null, string | null];
  if (!raw) return null;
  return { agreement: JSON.parse(raw) as Agreement, signatures: { client, provider } };
}

export async function saveAgreement(a: Agreement, signature?: { who: "client" | "provider"; image: string }) {
  const cmds: (string | number)[][] = [["HSET", AGREEMENTS, a.id, JSON.stringify(a)]];
  if (signature) cmds.push(["SET", sigKey(a.id, signature.who), signature.image]);
  await pipeline(cmds);
}

export async function deleteAgreement(id: string) {
  await pipeline([["HDEL", AGREEMENTS, id], ["DEL", sigKey(id, "client")], ["DEL", sigKey(id, "provider")]]);
}

// At most `max` actions per key per hour (used to stop the public form being flooded).
export async function underLimit(key: string, max: number) {
  const [count] = await pipeline([["INCR", `jf:limit:${key}`], ["EXPIRE", `jf:limit:${key}`, 3600, "NX"]]) as [number];
  return count <= max;
}

export { isDbConfigured };
