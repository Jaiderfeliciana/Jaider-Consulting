"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { getClients } from "@/lib/admin/data";
import { defaultSteps, deletePortal, getPortal, savePortal, type Portal } from "@/lib/portal/data";
import { siteUrl } from "@/lib/portal/auth";
import { sendEmail } from "@/lib/portal/email";
import { command } from "@/lib/admin/db";

type Result = { message: string; error: string };
const ok = (message: string): Result => ({ message, error: "" });
const fail = (error: string): Result => ({ message: "", error });
const text = (form: FormData, key: string, max = 300) => String(form.get(key) ?? "").trim().slice(0, max);
const isEmail = (s: string) => /^\S+@\S+\.\S+$/.test(s);
const LAST_PAYMENT_INFO = "jf:settings:payment-info";

async function load(form: FormData) {
  await requireAdmin();
  const clientId = text(form, "clientId", 64);
  const client = (await getClients()).find((c) => c.id === clientId);
  if (!client) throw new Error("Client not found");
  return { client, portal: await getPortal(clientId) };
}

const done = (clientId: string) => revalidatePath(`/admin/clients/${clientId}/portal`);

export async function createPortal(_prev: Result, form: FormData): Promise<Result> {
  const { client, portal } = await load(form);
  if (portal) return fail("This client already has a portal.");
  const email = text(form, "email", 160).toLowerCase();
  if (!isEmail(email)) return fail("Enter the client's email address.");
  const lastPaymentInfo = ((await command("GET", LAST_PAYMENT_INFO)) as string | null) ?? "";
  await savePortal({
    clientId: client.id, email, enabled: true, price: "", paymentInfo: lastPaymentInfo,
    steps: defaultSteps(client.service), links: [], messages: [], createdAt: new Date().toISOString(),
  });
  done(client.id);
  return ok("Portal created.");
}

export async function savePortalSettings(_prev: Result, form: FormData): Promise<Result> {
  const { client, portal } = await load(form);
  if (!portal) return fail("No portal yet.");
  const email = text(form, "email", 160).toLowerCase();
  if (!isEmail(email)) return fail("Enter a valid email address.");
  const wasDone = new Map(portal.steps.map((s) => [s.name.toLowerCase(), s.done]));
  const steps = String(form.get("steps") ?? "").split(/\r?\n/).map((s) => s.trim().slice(0, 80)).filter(Boolean).slice(0, 15)
    .map((name) => ({ name, done: wasDone.get(name.toLowerCase()) ?? false }));
  const paymentInfo = text(form, "paymentInfo", 1000);
  const next: Portal = { ...portal, email, price: text(form, "price", 20).replace(/[^0-9.,]/g, ""), paymentInfo, steps: steps.length ? steps : portal.steps };
  await savePortal(next, portal.email);
  if (paymentInfo) await command("SET", LAST_PAYMENT_INFO, paymentInfo);
  done(client.id);
  return ok("Saved.");
}

export async function toggleStep(form: FormData) {
  const { client, portal } = await load(form);
  if (!portal) return;
  const i = Number(form.get("index"));
  await savePortal({ ...portal, steps: portal.steps.map((s, j) => (j === i ? { ...s, done: !s.done } : s)) });
  done(client.id);
}

export async function addPortalLink(_prev: Result, form: FormData): Promise<Result> {
  const { client, portal } = await load(form);
  if (!portal) return fail("No portal yet.");
  const label = text(form, "label", 80);
  let url = text(form, "url", 500);
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  try { new URL(url); } catch { return fail("Enter a valid link."); }
  if (!label) return fail("Give the link a name.");
  await savePortal({ ...portal, links: [...portal.links, { id: randomUUID(), label, url }].slice(0, 30) });
  done(client.id);
  return ok("Link added.");
}

export async function removePortalLink(form: FormData) {
  const { client, portal } = await load(form);
  if (!portal) return;
  await savePortal({ ...portal, links: portal.links.filter((l) => l.id !== text(form, "linkId", 64)) });
  done(client.id);
}

export async function postPortalUpdate(_prev: Result, form: FormData): Promise<Result> {
  const { client, portal } = await load(form);
  if (!portal) return fail("No portal yet.");
  const message = text(form, "text", 4000);
  if (!message) return fail("Write an update first.");
  await savePortal({ ...portal, messages: [...portal.messages, { id: randomUUID(), from: "jaider" as const, text: message, at: new Date().toISOString(), files: [] }].slice(-500) });
  done(client.id);
  if (form.get("notify") === "on") {
    const sent = await sendEmail(portal.email, "New update on your project", [`Hi ${client.name.split(" ")[0]},`, message], { label: "Open your client portal", url: `${siteUrl(await headers())}/portal` });
    return sent.ok ? ok("Update posted and emailed to the client.") : ok(`Update posted, but the email wasn't sent: ${sent.error}`);
  }
  return ok("Update posted.");
}

export async function sendPortalInvite(_prev: Result, form: FormData): Promise<Result> {
  const { client, portal } = await load(form);
  if (!portal) return fail("No portal yet.");
  const sent = await sendEmail(portal.email, "Your client portal is ready", [
    `Hi ${client.name.split(" ")[0]},`,
    "Your client portal is ready. There you can follow your project's progress, see payments and documents, and send me your files and feedback.",
    `To log in, open the link and enter this email address (${portal.email}). You'll receive a login code.`,
  ], { label: "Open your client portal", url: `${siteUrl(await headers())}/portal` });
  return sent.ok ? ok(`Invitation emailed to ${portal.email}.`) : fail(sent.error ?? "Email not sent.");
}

export async function setPortalEnabled(form: FormData) {
  const { client, portal } = await load(form);
  if (!portal) return;
  await savePortal({ ...portal, enabled: form.get("enabled") === "on" });
  done(client.id);
}

export async function removePortal(form: FormData) {
  const { client, portal } = await load(form);
  if (portal) await deletePortal(portal);
  done(client.id);
}
