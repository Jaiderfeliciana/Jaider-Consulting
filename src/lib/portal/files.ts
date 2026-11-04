import "server-only";
import { get, put } from "@vercel/blob";

// Client uploads are stored as private files in Vercel Blob (needs BLOB_READ_WRITE_TOKEN).
// They are only served through /portal/files/..., which checks who is asking.

export const isFilesConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

// Total for all files in one message.
export const MAX_FILE_BYTES = 4 * 1024 * 1024;
export const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/heic",
  "application/pdf", "text/plain",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip", "application/x-zip-compressed",
];

export async function storeFile(clientId: string, file: File) {
  const safeName = file.name.replace(/[^\w.\- ]+/g, "_").slice(-80) || "file";
  const blob = await put(`portal/${clientId}/${safeName}`, file, {
    access: "private", addRandomSuffix: true, contentType: file.type || undefined,
  });
  return { name: file.name.slice(0, 120), path: blob.pathname, url: blob.url, size: file.size, type: file.type };
}

export async function readFile(url: string) {
  return get(url, { access: "private" });
}
