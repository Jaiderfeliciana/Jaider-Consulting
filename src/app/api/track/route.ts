import { GOALS, isDbConfigured, recordGoal, recordVisit, type Goal } from "@/lib/admin/data";

// Counts a page view. Stores only daily totals per page: no IP addresses, cookies or personal data.
export async function POST(request: Request) {
  if (!isDbConfigured()) return new Response(null, { status: 204 });
  let body: { path?: unknown; newVisitor?: unknown; goal?: unknown };
  try { body = await request.json(); } catch { return new Response(null, { status: 400 }); }
  if (typeof body.goal === "string") {
    if ((GOALS as readonly string[]).includes(body.goal)) await recordGoal(body.goal as Goal).catch(() => {});
    return new Response(null, { status: 204 });
  }
  const path = typeof body.path === "string" ? body.path.slice(0, 200) : "";
  if (!path.startsWith("/") || path.startsWith("/admin")) return new Response(null, { status: 204 });
  try {
    await recordVisit(path, body.newVisitor === true);
  } catch {
    // Never let counting break the website.
  }
  return new Response(null, { status: 204 });
}
