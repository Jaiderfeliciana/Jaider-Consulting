import { isDbConfigured, recordVisit } from "@/lib/admin/data";

// Counts a page view. Stores only daily totals per page: no IP addresses, cookies or personal data.
export async function POST(request: Request) {
  if (!isDbConfigured()) return new Response(null, { status: 204 });
  let body: { path?: unknown; newVisitor?: unknown };
  try { body = await request.json(); } catch { return new Response(null, { status: 400 }); }
  const path = typeof body.path === "string" ? body.path.slice(0, 200) : "";
  if (!path.startsWith("/") || path.startsWith("/admin")) return new Response(null, { status: 204 });
  try {
    await recordVisit(path, body.newVisitor === true);
  } catch {
    // Never let counting break the website.
  }
  return new Response(null, { status: 204 });
}
