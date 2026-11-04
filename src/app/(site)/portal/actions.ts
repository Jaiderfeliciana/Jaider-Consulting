"use server";

import { randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PORTAL_COOKIE, PORTAL_DAYS, createPortalSession } from "@/lib/admin/session";
import { isDbConfigured, underLimit } from "@/lib/admin/data";
import { checkLoginCode, createLoginCode, portalForEmail, savePortal, type PortalFile } from "@/lib/portal/data";
import { currentPortal, siteUrl } from "@/lib/portal/auth";
import { isEmailConfigured, sendEmail } from "@/lib/portal/email";
import { ALLOWED_TYPES, MAX_FILE_BYTES, isFilesConfigured, storeFile } from "@/lib/portal/files";
import { contact } from "@/content/site";

export type LoginState = { step: "email" | "code"; email: string; error: string };

const clientIp = async () => ((await headers()).get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";

export async function portalLogin(prev: LoginState, form: FormData): Promise<LoginState> {
  if (!isDbConfigured() || !isEmailConfigured()) return { ...prev, error: "The client portal isn't available yet. Please contact Jaider on WhatsApp." };

  if (form.get("intent") === "restart") return { step: "email", email: "", error: "" };

  if (prev.step === "email") {
    const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 160);
    if (!/^\S+@\S+\.\S+$/.test(email)) return { step: "email", email, error: "Please enter a valid email address." };
    if (!(await underLimit(`code-ip:${await clientIp()}`, 20)) || !(await underLimit(`code:${email}`, 5))) {
      return { step: "email", email, error: "Too many codes requested. Please wait an hour and try again." };
    }
    const portal = await portalForEmail(email);
    if (portal) {
      const code = await createLoginCode(email);
      const sent = await sendEmail(email, `${code} is your login code`, [
        "Here is your code to log in to your client portal:",
        code,
        "It works for 10 minutes. If you didn't ask for it, you can ignore this email.",
      ]);
      if (!sent.ok) return { step: "email", email, error: "We couldn't send the email. Please try again in a moment." };
    }
    // Same answer whether or not the email has a portal, so nobody can check which emails are clients.
    return { step: "code", email, error: "" };
  }

  const email = prev.email;
  const code = String(form.get("code") ?? "");
  const portal = await portalForEmail(email);
  if (!portal || !(await checkLoginCode(email, code))) {
    return { step: "code", email, error: "That code isn't right or has expired. Check the email or request a new code." };
  }
  (await cookies()).set(PORTAL_COOKIE, await createPortalSession(portal.clientId), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: PORTAL_DAYS * 86400,
  });
  redirect("/portal/home");
}

export async function portalLogout() {
  (await cookies()).delete(PORTAL_COOKIE);
  redirect("/portal");
}

export async function sendPortalMessage(_prev: { error: string; sent: number }, form: FormData) {
  const session = await currentPortal();
  if (!session) redirect("/portal");
  const { portal, client } = session;
  const text = String(form.get("text") ?? "").trim().slice(0, 4000);
  const uploads = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).slice(0, 5);
  if (!text && uploads.length === 0) return { error: "Write a message or choose a file.", sent: _prev.sent };
  if (uploads.length && !isFilesConfigured()) return { error: "File uploads aren't available yet. Please send your message without files.", sent: _prev.sent };
  if (uploads.reduce((sum, f) => sum + f.size, 0) > MAX_FILE_BYTES) {
    return { error: "Your files are larger than 4 MB together. Send fewer files at once, or share a Google Drive link.", sent: _prev.sent };
  }
  for (const f of uploads) {
    if (f.type && !ALLOWED_TYPES.includes(f.type)) return { error: `"${f.name}" isn't a supported file type (use images, PDF, Word, Excel or ZIP).`, sent: _prev.sent };
  }
  if (!(await underLimit(`msg:${client.id}`, 60))) return { error: "Too many messages in one hour. Please try again later.", sent: _prev.sent };

  let files: PortalFile[] = [];
  try {
    files = await Promise.all(uploads.map((f) => storeFile(client.id, f)));
  } catch {
    return { error: "Your files couldn't be uploaded. Please try again.", sent: _prev.sent };
  }
  const message = { id: randomUUID(), from: "client" as const, text, at: new Date().toISOString(), files };
  await savePortal({ ...portal, messages: [...portal.messages, message].slice(-500) });

  const base = siteUrl(await headers());
  await sendEmail(contact.email, `New message from ${client.name} in the client portal`, [
    `${client.name}${client.business ? ` (${client.business})` : ""} wrote:`,
    text || "(no text)",
    ...(files.length ? [`Files: ${files.map((f) => f.name).join(", ")}`] : []),
  ], { label: "Open in admin panel", url: `${base}/admin/clients/${client.id}/portal` });

  revalidatePath("/portal/home");
  return { error: "", sent: _prev.sent + 1 };
}
