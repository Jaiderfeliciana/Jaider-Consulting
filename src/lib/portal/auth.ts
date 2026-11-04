import "server-only";
import { cookies } from "next/headers";
import { PORTAL_COOKIE, portalClientId } from "@/lib/admin/session";
import { getClients, isDbConfigured } from "@/lib/admin/data";
import { getPortal } from "./data";

// The logged-in client's portal, or null (not logged in, or portal switched off).
export async function currentPortal() {
  if (!isDbConfigured()) return null;
  const clientId = await portalClientId((await cookies()).get(PORTAL_COOKIE)?.value);
  if (!clientId) return null;
  const portal = await getPortal(clientId);
  if (!portal?.enabled) return null;
  const client = (await getClients()).find((c) => c.id === clientId);
  return client ? { portal, client } : null;
}

// Base address for links in emails, e.g. https://www.jaiderfeliciana.com
export function siteUrl(h: Headers) {
  return `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host") ?? "www.jaiderfeliciana.com"}`;
}
