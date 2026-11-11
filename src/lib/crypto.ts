import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "node:crypto";

function key() {
  const s = process.env.AUTH_SECRET || "default_vow_session_secret_key_minimum_32_characters_long_for_security";
  return createHash("sha256").update(`vow-settings:${s}`).digest();
}

/** AES-256-GCM, key derived from AUTH_SECRET. Output: v1.<iv>.<tag>.<data> (base64url). */
export function encrypt(plain: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return ["v1", iv.toString("base64url"), c.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

export function decrypt(box: string): string | null {
  try {
    const [v, iv, tag, data] = box.split(".");
    if (v !== "v1") return null;
    const d = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
    d.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([d.update(Buffer.from(data, "base64url")), d.final()]).toString("utf8");
  } catch {
    return null;
  }
}

/** Salted, one-way IP fingerprint: groups abuse by source without storing the address. */
export function hashIp(ip: string) {
  return createHmac("sha256", key()).update(ip).digest("hex").slice(0, 16);
}
