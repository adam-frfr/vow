import "server-only";
import { hashIp } from "./crypto";
import { supabase } from "./supabase";
import { clientIp, hit } from "./rate-limit";

export type SecurityKind = "rate_limit" | "honeypot" | "spam" | "blocked_login" | "failed_login" | "ai_abuse";

/** Record an abuse signal for the admin. Never throws. */
export async function logSecurity(req: Request, kind: SecurityKind, scope = "", opts: { siteId?: string; detail?: string } = {}) {
  try {
    const id = "sec_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    await supabase.from("SecurityEvent").insert({
      id,
      kind,
      scope,
      ipHash: hashIp(clientIp(req)),
      siteId: opts.siteId,
      detail: (opts.detail ?? "").slice(0, 300),
      createdAt: new Date().toISOString(),
    });
  } catch {
    /* logging must not break the request */
  }
}

export const ipHashOf = (req: Request) => hashIp(clientIp(req));

/** Rate-limit a request; the first refusal in each window is logged for the admin. */
export async function guard(req: Request, scope: string, limit: number, windowMs: number, siteId?: string) {
  const { ok, firstDeny } = hit(req, scope, limit, windowMs);
  if (firstDeny) await logSecurity(req, "rate_limit", scope, { siteId });
  return ok;
}
