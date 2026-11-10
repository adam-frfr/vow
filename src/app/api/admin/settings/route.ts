import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/admin-api";
import { SETTINGS, setSetting, settingsForAdmin, type SettingKey } from "@/lib/settings";

const VALID: Partial<Record<SettingKey, z.ZodType<string>>> = {
  "ai.dailyLimit": z.string().regex(/^\d{1,5}$/),
  "ai.guestDailyLimit": z.string().regex(/^\d{1,6}$/),
  "pay.amount": z.string().regex(/^\d{1,7}$/),
  "pay.currency": z.string().regex(/^[a-z]{3}$/),
  "groq.model": z.string().regex(/^[\w./:-]{2,80}$/),
  "groq.apiKey": z.string().max(200),
  "stripe.secretKey": z.string().regex(/^$|^(sk|rk)_(test|live)_[\w]{10,}$/, "That doesn't look like a Stripe secret key (sk_test_… or sk_live_…)."),
  "stripe.webhookSecret": z.string().regex(/^$|^whsec_[\w]{10,}$/, "Webhook secrets start with whsec_."),
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
    return NextResponse.json(await settingsForAdmin());
  });
}
