// Simple in-memory fixed-window limiter. Fine for a single server; swap for
// Redis/Upstash when running multiple instances.
const buckets = new Map<string, { count: number; reset: number }>();

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export function rateLimit(req: Request, scope: string, limit: number, windowMs: number) {
  const key = `${scope}:${clientIp(req)}`;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 10_000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return true;
  }
  b.count++;
  return b.count <= limit;
}

/** Like rateLimit, but also says whether this is the first refusal in the window (log it once). */
export function hit(req: Request, scope: string, limit: number, windowMs: number) {
  const ok = rateLimit(req, scope, limit, windowMs);
  const b = buckets.get(`${scope}:${clientIp(req)}`);
  return { ok, firstDeny: !ok && b?.count === limit + 1 };
}
