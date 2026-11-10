import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/admin-api";
import { SETTINGS, setSetting, settingsForAdmin, type SettingKey } from "@/lib/settings";
import { forgetStorageConfig } from "@/lib/storage";
import { ensureWebhook } from "@/lib/stripe";

const VALID: Partial<Record<SettingKey, z.ZodType<string>>> = {
  "ai.dailyLimit": z.string().regex(/^\d{1,5}$/),
  "ai.guestDailyLimit": z.string().regex(/^\d{1,6}$/),
  "pay.amount": z.string().regex(/^\d{1,7}$/),
  "pay.currency": z.string().regex(/^[a-z]{3}$/),
  "groq.model": z.string().regex(/^[\w./:-]{2,80}$/),
  "groq.apiKey": z.string().max(200),
  "stripe.secretKey": z.string().regex(/^$|^(sk|rk)_(test|live)_[\w]{10,}$/, "That doesn't look like a Stripe secret key (sk_test_… or sk_live_…)."),
  "stripe.webhookSecret": z.string().regex(/^$|^whsec_[\w]{10,}$/, "Webhook secrets start with whsec_."),
  "b2.endpoint": z.string().regex(/^$|^https?:\/\/[\w.-]+(:\d+)?(\/[\w.-]+)*\/?$/, "Use the bucket's S3 endpoint, e.g. https://s3.us-west-004.backblazeb2.com"),
  "b2.bucket": z.string().regex(/^$|^[A-Za-z0-9-]{6,63}$/, "Bucket names are 6-63 letters, numbers or dashes."),
  "b2.keyId": z.string().regex(/^$|^[\w]{10,64}$/, "That doesn't look like a Backblaze key ID."),
  "b2.appKey": z.string().max(200),
};
const BOOL = z.enum(["true", "false"]);

export async function GET() {
  return withAdmin(async () => NextResponse.json(await settingsForAdmin()));
}

export async function PATCH(req: Request) {
  return withAdmin(async () => {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    for (const [k, v] of Object.entries(body)) {
      if (!(k in SETTINGS) || typeof v !== "string") return NextResponse.json({ error: `Unknown setting ${k}` }, { status: 400 });
      const key = k as SettingKey;
      const schema = VALID[key] ?? (SETTINGS[key].default === "true" || SETTINGS[key].default === "false" ? BOOL : z.string().max(500));
      const r = schema.safeParse(v.trim());
      if (!r.success) return NextResponse.json({ error: r.error.issues[0]?.message ?? `Invalid value for ${SETTINGS[key].label}` }, { status: 400 });
    }
    for (const [k, v] of Object.entries(body)) await setSetting(k as SettingKey, (v as string).trim());
    forgetStorageConfig();
    // A new Stripe key: create the webhook and save its secret automatically.
    let notice: { ok: boolean; message: string } | undefined;
    // (Skipped when the admin typed a signing secret themselves in the same save.)
    if (typeof body["stripe.secretKey"] === "string" && body["stripe.secretKey"].trim() && !body["stripe.webhookSecret"]) {
      const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
      const proto = req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "");
      notice = await ensureWebhook(`${proto}://${host}`);
    }
    return NextResponse.json({ ...(await settingsForAdmin()), ...(notice ? { _notice: notice } : {}) });
  });
}
