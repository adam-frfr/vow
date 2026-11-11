import "server-only";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { AwsClient } from "aws4fetch";
import { supabase } from "./supabase";
import { getSetting } from "./settings";

/**
 * File storage. Backblaze B2 (S3-compatible API) when the admin has entered
 * its keys in /admin/storage; otherwise files are kept in the database so a
 * fresh deploy works before B2 is set up.
 *
 * Keys: "uploads/<siteId>/<uuid>.<ext>" for couples' photos,
 *       "assets/<library|florals|fx|cutouts>/..." for the art library.
 */

export const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
/** Vercel caps request bodies at 4.5 MB; the editor shrinks bigger photos before upload. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const TYPE_BY_EXT: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", svg: "image/svg+xml", json: "application/json" };
const typeFor = (key: string) => TYPE_BY_EXT[key.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream";

interface B2 {
  client: AwsClient;
  base: string;
}

let b2Cache: { at: number; b2: B2 | null } | null = null;

/** The configured bucket, or null. Cached briefly so asset requests don't hit the database. */
export async function b2(): Promise<B2 | null> {
  if (b2Cache && Date.now() - b2Cache.at < 30_000) return b2Cache.b2;
  const [endpoint, bucket, keyId, appKey] = await Promise.all([getSetting("b2.endpoint"), getSetting("b2.bucket"), getSetting("b2.keyId"), getSetting("b2.appKey")]);
  let out: B2 | null = null;
  if (endpoint && bucket && keyId && appKey) {
    const url = endpoint.replace(/\/+$/, "");
    const region = url.match(/s3\.([a-z0-9-]+)\.backblazeb2\.com/)?.[1] ?? "us-east-1";
    out = { client: new AwsClient({ accessKeyId: keyId, secretAccessKey: appKey, service: "s3", region }), base: `${url}/${encodeURIComponent(bucket)}` };
  }
  b2Cache = { at: Date.now(), b2: out };
  return out;
}

export function forgetStorageConfig() {
  b2Cache = null;
}

/** Backblaze asks clients to retry 429/5xx ("busy") responses; network blips get the same treatment. */
async function b2Fetch(b: B2, url: string, init?: RequestInit): Promise<Response> {
  let last: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 250 * 2 ** attempt));
    try {
      // Sign, then send the raw bytes ourselves: passing the signed Request to fetch would
      // stream the body without a Content-Length, which S3/Backblaze rejects (411).
      const signed = await b.client.sign(url, init);
      const res = await fetch(signed.url, { method: signed.method, headers: signed.headers, body: init?.body, cache: "no-store" });
      if (res.status !== 429 && res.status < 500) return res;
      last = new Error(`Backblaze busy (${res.status})`);
      if (attempt === 3) return res;
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

const objectUrl = (b: B2, key: string) => `${b.base}/${key.split("/").map(encodeURIComponent).join("/")}`;

export async function putObject(key: string, type: string, bytes: Uint8Array) {
  const b = await b2();
  if (b) {
    const res = await b2Fetch(b, objectUrl(b, key), { method: "PUT", body: bytes as BodyInit, headers: { "Content-Type": type } });
    if (!res.ok) throw new Error(`Backblaze upload failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
    return;
  }
  const { error } = await supabase.storage.from("photos").upload(key, bytes, {
    contentType: type,
    upsert: true,
  });
  if (error) {
    console.error("[supabase storage upload error]", error);
  }
}

export async function getObject(key: string): Promise<{ data: Uint8Array; type: string } | null> {
  const b = await b2();
  if (b) {
    const res = await b2Fetch(b, objectUrl(b, key));
    if (res.ok) return { data: new Uint8Array(await res.arrayBuffer()), type: res.headers.get("content-type") || typeFor(key) };
    if (res.status !== 404) console.error(`Backblaze read failed (${res.status}) for ${key}`);
  }
  const { data, error } = await supabase.storage.from("photos").download(key);
  if (error || !data) return null;
  return { data: new Uint8Array(await data.arrayBuffer()), type: typeFor(key) };
}

export async function deleteObject(key: string) {
  const b = await b2();
  if (b) await b2Fetch(b, objectUrl(b, key), { method: "DELETE" }).catch(() => undefined);
  await supabase.storage.from("photos").remove([key]);
}

/** Checks the keys work: writes, reads back and deletes a tiny file. */
export async function testB2(): Promise<{ ok: boolean; message: string }> {
  forgetStorageConfig();
  const b = await b2();
  if (!b) return { ok: false, message: "Enter the endpoint, bucket, key ID and application key first." };
  const key = `healthcheck/${randomUUID()}.txt`;
  try {
    const probe = `vow-check-${randomUUID()}`;
    const put = await b2Fetch(b, objectUrl(b, key), { method: "PUT", body: new TextEncoder().encode(probe), headers: { "Content-Type": "text/plain" } });
    if (!put.ok) return { ok: false, message: `Upload refused (${put.status}). Check the key can read and write this bucket.` };
    const get = await b2Fetch(b, objectUrl(b, key));
    const back = get.ok ? await get.text() : "";
    await b2Fetch(b, objectUrl(b, key), { method: "DELETE" }).catch(() => undefined);
    if (!get.ok) return { ok: false, message: `Upload worked but reading it back failed (${get.status}).` };
    if (back !== probe) return { ok: false, message: "Backblaze returned a different file than was uploaded." };
    return { ok: true, message: "Connected: Backblaze accepted a test file and returned it." };
  } catch (e) {
    return { ok: false, message: `Could not reach Backblaze: ${(e as Error).message}` };
  }
}

// ── Couples' photos ───────────────────────────────────────────────

export async function storeFile(prefix: string, type: string, bytes: Uint8Array) {
  const ext = ALLOWED_TYPES[type];
  if (!ext) throw new Error("Unsupported file type");
  const key = `${prefix}/${randomUUID()}.${ext}`;
  await putObject(`uploads/${key}`, type, bytes);
  return { key, url: `/api/uploads/${key}` };
}

export const readStored = (key: string) => getObject(`uploads/${key}`);
export const deleteStored = (key: string) => deleteObject(`uploads/${key}`);

// ── Art library ───────────────────────────────────────────────────

export const ASSET_ROOTS = ["library", "florals", "fx", "cutouts"] as const;
export type AssetRoot = (typeof ASSET_ROOTS)[number];
const LOCAL_ASSETS = path.join(process.cwd(), "assets");
const ASSET_HEADERS = (type: string) => ({
  "Content-Type": type,
  "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
  "X-Content-Type-Options": "nosniff",
});

/** Serves one art file: from B2 (or the database) first, then the copy shipped with the site. */
export async function assetResponse(root: AssetRoot, parts: string[]): Promise<Response> {
  const rel = parts.join("/");
  if (!/^[a-z0-9][a-z0-9/_.-]*$/i.test(rel) || rel.includes("..")) return new Response("Not found", { status: 404 });
  const stored = await getObject(`assets/${root}/${rel}`).catch(() => null);
  if (stored) return new Response(stored.data as BodyInit, { headers: ASSET_HEADERS(stored.type) });
  try {
    const data = await readFile(path.join(LOCAL_ASSETS, root, ...parts));
    return new Response(new Uint8Array(data), { headers: ASSET_HEADERS(typeFor(rel)) });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

/** Every built-in art file, as paths like "library/peony.webp" (for copying the library to B2). */
export async function listLocalAssets(): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string, rel: string) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (e.isDirectory()) await walk(path.join(dir, e.name), `${rel}/${e.name}`);
      else out.push(`${rel}/${e.name}`);
    }
  }
  for (const r of ASSET_ROOTS) await walk(path.join(LOCAL_ASSETS, r), r).catch(() => undefined);
  return out.sort();
}

export async function readLocalAsset(rel: string) {
  return new Uint8Array(await readFile(path.join(LOCAL_ASSETS, ...rel.split("/"))));
}

/** Check magic bytes so a renamed file can't pass as an image. */
export function sniffImageType(b: Uint8Array): string | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v)) return "image/png";
  const ascii = (s: number, e: number) => String.fromCharCode(...b.subarray(s, e));
  if (b.length > 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}
