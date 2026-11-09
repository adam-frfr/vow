import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * Local-disk storage driver. Files live outside /public and are served via
 * /api/uploads/[...key]. For production on serverless hosts, replace these
 * three functions with S3 / Cloudflare R2 / Supabase Storage calls.
 */
const ROOT = path.resolve(process.env.UPLOAD_DIR || "./uploads");

export const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

function resolveKey(key: string) {
  const full = path.resolve(ROOT, key);
  if (!full.startsWith(ROOT + path.sep)) throw new Error("Invalid storage key");
  return full;
}

export async function storeFile(prefix: string, type: string, bytes: Buffer) {
  const ext = ALLOWED_TYPES[type];
  if (!ext) throw new Error("Unsupported file type");
  const key = `${prefix}/${randomUUID()}.${ext}`;
  const full = resolveKey(key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, bytes);
  return { key, url: `/api/uploads/${key}` };
}

export async function readStored(key: string) {
  return readFile(resolveKey(key));
}

export async function deleteStored(key: string) {
  await unlink(resolveKey(key)).catch(() => undefined);
}

/** Check magic bytes so a renamed file can't pass as an image. */
export function sniffImageType(b: Buffer): string | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.length > 12 && b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") return "image/webp";
  return null;
}
