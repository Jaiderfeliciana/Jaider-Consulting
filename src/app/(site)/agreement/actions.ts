"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { agreement } from "@/content/agreement";
import { isDbConfigured, saveAgreement, underLimit } from "@/lib/admin/data";

export type SignState = { error: string };

const field = (form: FormData, key: string, max: number) => String(form.get(key) ?? "").trim().slice(0, max);
const isSignature = (s: string) => s.startsWith("data:image/png;base64,") && s.length > 1500 && s.length < 400_000;

export async function signAgreement(_prev: SignState, form: FormData): Promise<SignState> {
  if (field(form, "website_url", 200)) return { error: "" }; // filled only by spam bots
  if (!isDbConfigured()) return { error: "Online signing isn't available right now. Please contact Jaider on WhatsApp." };

  const fullName = field(form, "fullName", 120);
  const email = field(form, "email", 160);
  const service = field(form, "service", 120);
  const price = field(form, "price", 20).replace(/[^0-9.,]/g, "");
  const signature = String(form.get("signature") ?? "");
  if (!fullName) return { error: "Please enter your full name." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Please enter a valid email address." };
  if (!service) return { error: "Please choose the service you are purchasing." };
  if (!price) return { error: "Please enter the agreed price." };
  if (!isSignature(signature)) return { error: "Please sign inside the signature box." };
  if (form.get("accept") !== "on") return { error: "Please confirm that you have read and accept the terms." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  if (!(await underLimit(`sign:${ip}`, 5))) return { error: "Too many agreements were signed from this connection. Please try again later." };

  const id = randomUUID();
  await saveAgreement(
    {
      id, version: agreement.version, fullName, email, service, price,
      company: field(form, "company", 120),
      signedAt: new Date().toISOString(),
      ip,
      userAgent: (h.get("user-agent") ?? "").slice(0, 300),
    },
    { who: "client", image: signature },
  );
  redirect(`/agreement/signed/${id}`);
}
