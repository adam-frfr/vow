import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "./db";
import { getBool, getSetting, setSetting } from "./settings";

/** Stripe REST API. STRIPE_API_BASE exists only for local testing against a mock. */
const BASE = () => process.env.STRIPE_API_BASE || "https://api.stripe.com/v1";

export type PremiumFeature = "ai" | "guestHelper" | "password" | "branding";

export async function payConfig() {
  const [enabled, key, amount, currency, features] = await Promise.all([
    getBool("pay.enabled"),
    getSetting("stripe.secretKey"),
    getSetting("pay.amount"),
    getSetting("pay.currency"),
    getSetting("pay.features"),
  ]);
  return {
    /** Payments actually work (on + key set). */
    live: enabled && !!key,
    amount: Number(amount) || 0,
    currency,
    features: features.split(",").filter(Boolean) as PremiumFeature[],
  };
}

/** Does this site need Premium for a feature right now? */
export async function needsPremium(feature: PremiumFeature, site: { premium: boolean }) {
  if (site.premium) return false;
  const cfg = await payConfig();
  return cfg.live && cfg.features.includes(feature);
}

async function stripe(path: string, init: { method?: string; form?: Record<string, string> } = {}) {
  const key = await getSetting("stripe.secretKey");
  if (!key) throw new Error("Stripe is not configured");
  const res = await fetch(`${BASE()}${path}`, {
    method: init.method ?? (init.form ? "POST" : "GET"),
    headers: { Authorization: `Bearer ${key}`, ...(init.form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) },
    body: init.form ? new URLSearchParams(init.form).toString() : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message ?? `Stripe error ${res.status}`);
  return data;
}

export async function createCheckout(opts: { siteId: string; userId: string; email: string; names: string; origin: string }) {
  const cfg = await payConfig();
  const session = await stripe("/checkout/sessions", {
    form: {
      mode: "payment",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": cfg.currency,
      "line_items[0][price_data][unit_amount]": String(cfg.amount),
      "line_items[0][price_data][product_data][name]": `Vow Premium: ${opts.names}`.slice(0, 120),
      "line_items[0][price_data][product_data][description]": "One-time upgrade for one wedding website.",
      customer_email: opts.email,
      client_reference_id: opts.siteId,
      "metadata[siteId]": opts.siteId,
      "metadata[userId]": opts.userId,
      success_url: `${opts.origin}/dashboard/sites/${opts.siteId}?paid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${opts.origin}/dashboard/sites/${opts.siteId}?paid=cancelled`,
    },
  });
  await db.payment.create({
    data: { siteId: opts.siteId, userId: opts.userId, sessionId: session.id, amount: cfg.amount, currency: cfg.currency, status: "pending" },
  });
  return session.url as string;
}

/** Mark a checkout session paid (idempotent). Used by the webhook and the return-page check. */
export async function markPaid(sessionId: string, session: { payment_status?: string; metadata?: { siteId?: string; userId?: string } }) {
  if (session.payment_status !== "paid") return false;
  const payment = await db.payment.findUnique({ where: { sessionId } });
  if (!payment || payment.siteId !== session.metadata?.siteId) return false;
  if (payment.status !== "paid") {
    await db.$transaction([
      db.payment.update({ where: { sessionId }, data: { status: "paid" } }),
      db.site.update({ where: { id: payment.siteId }, data: { premium: true } }),
    ]);
  }
  return true;
}

/** After Stripe redirects back: confirm directly with Stripe (works even without a webhook). */
export async function confirmSession(sessionId: string, userId: string) {
  if (!/^cs_[\w]+$/.test(sessionId)) return false;
  const payment = await db.payment.findUnique({ where: { sessionId } });
  if (!payment || payment.userId !== userId) return false;
  if (payment.status === "paid") return true;
  try {
    return await markPaid(sessionId, await stripe(`/checkout/sessions/${sessionId}`));
  } catch {
    return false;
  }
}

/** Verify a Stripe-Signature header (HMAC-SHA256 of "t.payload", 5 minute tolerance). */
export function verifyStripeSignature(payload: string, header: string | null, secret: string, now = Date.now()) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = Number(parts.t);
  if (!t || Math.abs(now / 1000 - t) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return header
    .split(",")
    .filter((p) => p.startsWith("v1="))
    .some((p) => {
      const sig = Buffer.from(p.slice(3), "hex");
      const exp = Buffer.from(expected, "hex");
      return sig.length === exp.length && timingSafeEqual(sig, exp);
    });
}

/**
 * Points Stripe at this site's webhook and saves the signing secret, so the
 * admin never has to open Stripe's dashboard. Replaces any earlier endpoint
 * for the same URL (Stripe only reveals a secret when an endpoint is created).
 */
export async function ensureWebhook(origin: string): Promise<{ ok: boolean; message: string }> {
  const url = `${origin.replace(/\/+$/, "")}/api/pay/webhook`;
  const local = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (!url.startsWith("https://") && !(local && process.env.STRIPE_API_BASE)) {
    return { ok: false, message: "Stripe webhooks need a public https address. This will happen automatically when you save the key on your live site." };
  }
  try {
    const list = await stripe("/webhook_endpoints?limit=100");
    for (const ep of (list?.data ?? []) as { id: string; url: string }[]) {
      if (ep.url === url) await stripe(`/webhook_endpoints/${ep.id}`, { method: "DELETE" });
    }
    const created = await stripe("/webhook_endpoints", {
      form: { url, "enabled_events[0]": "checkout.session.completed", description: "Vow wedding sites: Premium upgrades" },
    });
    if (!created?.secret) return { ok: false, message: "Stripe created the webhook but did not return its secret." };
    await setSetting("stripe.webhookSecret", created.secret);
    return { ok: true, message: `Stripe webhook set up for ${url}.` };
  } catch (e) {
    return { ok: false, message: `Couldn't set up the Stripe webhook: ${(e as Error).message}` };
  }
}
