import "server-only";
import { isDbConfigured } from "./db";

export type Loaded<T> = { connected: false } | { connected: true; data: T } | { connected: true; error: string };

// Runs a database read, reporting "not connected" or the error instead of failing the whole page.
export async function fromDb<T>(read: () => Promise<T>): Promise<Loaded<T>> {
  if (!isDbConfigured()) return { connected: false };
  try {
    return { connected: true, data: await read() };
  } catch (e) {
    return { connected: true, error: e instanceof Error ? e.message : "Could not read the database." };
  }
}
