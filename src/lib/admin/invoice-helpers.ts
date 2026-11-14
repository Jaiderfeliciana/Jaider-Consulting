import "server-only";
import { packages, services } from "@/content/site";
import type { Client } from "./data";

// Services and packages from the website's price list, for quickly adding invoice lines.
export function quickItems() {
  const price = (s: string) => Number(s.replace(/,/g, "").match(/\d+(\.\d+)?/)?.[0] ?? 0);
  return [
    ...services.map((s) => ({ description: s.title + (s.priceNote ? ` (${s.priceNote})` : ""), price: price(s.price) })),
    ...packages.map((p) => ({ description: `${p.name} — one-time setup`, price: price(p.price) })),
    ...packages.map((p) => ({ description: `${p.monthlyName} — monthly plan`, price: price(p.monthly) })),
  ].filter((q) => q.price > 0);
}

export const clientOptions = (clients: Client[]) =>
  clients.map((c) => ({ id: c.id, label: c.business ? `${c.business} (${c.name})` : c.name, email: /@/.test(c.contact) ? c.contact : "" }));
