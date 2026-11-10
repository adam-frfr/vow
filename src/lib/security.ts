import "server-only";
import { hashIp } from "./crypto";
import { db } from "./db";
import { clientIp, hit } from "./rate-limit";

export type SecurityKind = "rate_limit" | "honeypot" | "spam" | "blocked_login" | "failed_login" | "ai_abuse";

/** Record an abuse signal for the admin. Never throws. */
export async function logSecurity(req: Request, kind: SecurityKind, scope = "", opts: { siteId?: string; detail?: string } = {}) {
  try {
    await db.securityEvent.create({
      data: { kind, scope, ipHash: hashIp(clientIp(req)), siteId: opts.siteId, detail: (opts.detail ?? "").slice(0, 300) },
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
