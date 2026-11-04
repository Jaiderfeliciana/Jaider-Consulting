// Admin login sessions: a signed cookie that proves the password was entered.
// The signing key is ADMIN_SESSION_SECRET (or the password itself), so changing
// the password logs out every existing session. Works in the proxy and on the server.

export const SESSION_COOKIE = "jf_admin";
export const SESSION_DAYS = 14;

function signingKey() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

async function hmac(message: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(signingKey()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSessionValue() {
  const expires = Date.now() + SESSION_DAYS * 86400000;
  return `${expires}.${await hmac(`admin:${expires}`)}`;
}

export async function isValidSession(value: string | undefined) {
  if (!value || !signingKey()) return false;
  const [expires, sig] = value.split(".");
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  const expected = await hmac(`admin:${expires}`);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

// ---------- client portal sessions ----------
// Same signing key, different purpose prefix, so an admin cookie can never pass as a portal cookie or vice versa.

export const PORTAL_COOKIE = "jf_portal";
export const PORTAL_DAYS = 30;

export async function createPortalSession(clientId: string) {
  const expires = Date.now() + PORTAL_DAYS * 86400000;
  return `${clientId}.${expires}.${await hmac(`portal:${clientId}:${expires}`)}`;
}

// Returns the client id if the cookie is valid.
export async function portalClientId(value: string | undefined) {
  if (!value || !signingKey()) return null;
  const [clientId, expires, sig] = value.split(".");
  if (!clientId || !expires || !sig || Number(expires) < Date.now()) return null;
  const expected = await hmac(`portal:${clientId}:${expires}`);
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? clientId : null;
}
