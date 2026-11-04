import { cookies } from "next/headers";
import { PORTAL_COOKIE, SESSION_COOKIE, isValidSession, portalClientId } from "@/lib/admin/session";
import { getPortal } from "@/lib/portal/data";
import { readFile } from "@/lib/portal/files";

// Serves a private uploaded file to the client it belongs to, or to Jaider when logged in to the admin panel.
// Only files attached to a message in that client's portal can be opened.
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const notFound = () => new Response("Not found", { status: 404 });
  const { path } = await params;
  const pathname = path.map(decodeURIComponent).join("/");
  const [root, owner] = pathname.split("/");
  if (root !== "portal" || !owner) return notFound();
  const jar = await cookies();
  const isAdmin = await isValidSession(jar.get(SESSION_COOKIE)?.value);
  if (!isAdmin && (await portalClientId(jar.get(PORTAL_COOKIE)?.value)) !== owner) return notFound();

  const record = (await getPortal(owner))?.messages.flatMap((m) => m.files).find((f) => f.path === pathname);
  if (!record) return notFound();
  const file = await readFile(record.url).catch(() => null);
  if (!file || file.statusCode !== 200) return notFound();
  return new Response(file.stream, {
    headers: {
      "Content-Type": file.blob.contentType || "application/octet-stream",
      // SVGs can contain scripts: always download them. Everything else may open in the browser, sandboxed.
      "Content-Disposition": `${/svg/i.test(file.blob.contentType ?? "") ? "attachment" : "inline"}; filename="${record.name.replace(/["\r\n]/g, "")}"`,
      "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
