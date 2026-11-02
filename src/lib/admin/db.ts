import "server-only";

// Minimal client for an Upstash Redis database over its REST API.
// Vercel's Upstash integration sets KV_REST_API_URL / KV_REST_API_TOKEN;
// Upstash itself uses UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN. Either works.

function credentials() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

export const isDbConfigured = () => credentials() !== null;

type Command = (string | number)[];

export async function pipeline(commands: Command[]): Promise<unknown[]> {
  const c = credentials();
  if (!c) throw new Error("Database not connected");
  const res = await fetch(`${c.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Database error (${res.status})`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  const failed = out.find((r) => r.error);
  if (failed) throw new Error(`Database error: ${failed.error}`);
  return out.map((r) => r.result);
}

export async function command(...cmd: Command) {
  return (await pipeline([cmd]))[0];
}
