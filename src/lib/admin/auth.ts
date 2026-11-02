import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, isValidSession } from "./session";

// Call at the start of every admin page and action: the proxy only redirects,
// this is the check that actually protects the data.
export async function requireAdmin() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!(await isValidSession(value))) redirect("/admin/login");
}
