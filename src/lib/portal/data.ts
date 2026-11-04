import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { command, pipeline } from "@/lib/admin/db";

export type PortalFile = { name: string; path: string; url: string; size: number; type: string };
export type PortalMessage = { id: string; from: "client" | "jaider"; text: string; at: string; files: PortalFile[] };
export type Portal = {
  clientId: string;
  email: string;
  enabled: boolean;
  price: string;
  paymentInfo: string;
  steps: { name: string; done: boolean }[];
  links: { id: string; label: string; url: string }[];
  messages: PortalMessage[];
  createdAt: string;
};

const key = (clientId: string) => `jf:portal:${clientId}`;
const emailKey = (email: string) => `jf:portal-email:${email.toLowerCase()}`;
const codeKey = (email: string) => `jf:portal-code:${email.toLowerCase()}`;

// Project steps to start from, by service. Jaider can edit them per client.
export function defaultSteps(service: string) {
  const s = service.toLowerCase();
  const names =
    s.includes("website") ? ["Kickoff call", "Content & materials", "Design", "Build", "Review & changes", "Launch"]
    : s.includes("social") ? ["Kickoff call", "Strategy & content plan", "First posts approved", "Posting live", "Monthly report"]
    : s.includes("ads") ? ["Kickoff call", "Campaign plan", "Ads set up", "Ads live", "First report"]
    : s.includes("brand") ? ["Kickoff call", "Concepts", "Revisions", "Final files"]
    : s.includes("seo") ? ["Audit", "Google Business Profile", "On-page fixes", "Monthly report"]
    : s.includes("chatbot") || s.includes("grok") ? ["Kickoff call", "Business info & training", "Testing", "Launch"]
    : ["Kickoff call", "In progress", "Review", "Done"];
  return names.map((name) => ({ name, done: false }));
}

export async function getPortal(clientId: string) {
  const raw = (await command("GET", key(clientId))) as string | null;
  return raw ? (JSON.parse(raw) as Portal) : null;
}

export async function savePortal(portal: Portal, previousEmail?: string) {
  const cmds: (string | number)[][] = [["SET", key(portal.clientId), JSON.stringify(portal)]];
  if (previousEmail && previousEmail.toLowerCase() !== portal.email.toLowerCase()) cmds.push(["DEL", emailKey(previousEmail)]);
  if (portal.email) cmds.push(["SET", emailKey(portal.email), portal.clientId]);
  await pipeline(cmds);
}

export async function deletePortal(portal: Portal) {
  await pipeline([["DEL", key(portal.clientId)], ["DEL", emailKey(portal.email)]]);
}

export async function portalForEmail(email: string) {
  const clientId = (await command("GET", emailKey(email))) as string | null;
  if (!clientId) return null;
  const portal = await getPortal(clientId);
  return portal?.enabled ? portal : null;
}

// ---------- one-time login codes ----------

const hashCode = (email: string, code: string) =>
  createHash("sha256").update(`${email.toLowerCase()}:${code}:${process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || ""}`).digest("hex");

export async function createLoginCode(email: string) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await command("SET", codeKey(email), JSON.stringify({ hash: hashCode(email, code), tries: 0 }), "EX", 600);
  return code;
}

// True if the code is right. Five wrong tries and the code stops working.
export async function checkLoginCode(email: string, code: string) {
  const raw = (await command("GET", codeKey(email))) as string | null;
  if (!raw) return false;
  const saved = JSON.parse(raw) as { hash: string; tries: number };
  if (saved.tries >= 5) return false;
  const ok = timingSafeEqual(Buffer.from(saved.hash), Buffer.from(hashCode(email, code.replace(/\D/g, ""))));
  if (ok) await command("DEL", codeKey(email));
  else await command("SET", codeKey(email), JSON.stringify({ ...saved, tries: saved.tries + 1 }), "KEEPTTL");
  return ok;
}
