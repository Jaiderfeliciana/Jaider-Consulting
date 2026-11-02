"use server";

import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { SESSION_COOKIE, SESSION_DAYS, createSessionValue } from "@/lib/admin/session";
import { adminConfig, type ClientStatus } from "@/lib/admin/config";
import { dayKey } from "@/lib/admin/dates";
import * as data from "@/lib/admin/data";

const text = (form: FormData, key: string, max = 300) => String(form.get(key) ?? "").trim().slice(0, max);

// ---------- login ----------

export async function login(_prev: { error: string }, form: FormData) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return { error: "No admin password is set yet. Add ADMIN_PASSWORD in Vercel first." };
  const given = text(form, "password", 200);
  const hash = (s: string) => createHash("sha256").update(s).digest();
  if (!timingSafeEqual(hash(given), hash(expected))) {
    await new Promise((r) => setTimeout(r, 800)); // slow down password guessing
    return { error: "That password is not correct." };
  }
  (await cookies()).set(SESSION_COOKIE, await createSessionValue(), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: SESSION_DAYS * 86400,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---------- clients ----------

const asStatus = (v: string): ClientStatus =>
  (adminConfig.clientStatuses as readonly string[]).includes(v) ? (v as ClientStatus) : "Lead";

export async function addClient(form: FormData) {
  await requireAdmin();
  const name = text(form, "name", 120);
  if (!name) return;
  await data.saveClient({
    id: randomUUID(),
    name,
    business: text(form, "business", 120),
    contact: text(form, "contact", 160),
    links: text(form, "links", 300),
    service: text(form, "service", 80),
    status: asStatus(text(form, "status")),
    notes: text(form, "notes", 1000),
    createdAt: new Date().toISOString(),
  });
  revalidatePath("/admin", "layout");
}

export async function setClientStatus(form: FormData) {
  await requireAdmin();
  const id = text(form, "id", 64);
  const client = (await data.getClients()).find((c) => c.id === id);
  if (!client) return;
  await data.saveClient({ ...client, status: asStatus(text(form, "status")) });
  revalidatePath("/admin", "layout");
}

export async function removeClient(form: FormData) {
  await requireAdmin();
  await data.deleteClient(text(form, "id", 64));
  revalidatePath("/admin", "layout");
}

// ---------- payments ----------

export async function addPayment(form: FormData) {
  await requireAdmin();
  const amount = Math.round(Number(text(form, "amount", 20).replace(/[^0-9.]/g, "")) * 100) / 100;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(text(form, "date", 10)) ? text(form, "date", 10) : dayKey();
  if (!(amount > 0)) return;
  await data.savePayment({
    id: randomUUID(),
    client: text(form, "client", 120),
    description: text(form, "description", 200),
    amount,
    date,
    createdAt: new Date().toISOString(),
  });
  revalidatePath("/admin", "layout");
}

export async function removePayment(form: FormData) {
  await requireAdmin();
  await data.deletePayment(text(form, "id", 64));
  revalidatePath("/admin", "layout");
}
