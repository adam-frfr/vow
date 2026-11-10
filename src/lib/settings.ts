import "server-only";
import { decrypt, encrypt } from "./crypto";
import { db } from "./db";

/** Everything the admin can change from /admin/settings. */
export const SETTINGS = {
  "groq.apiKey": { secret: true, default: "", label: "Groq API key" },
  "groq.model": { secret: false, default: "llama-3.3-70b-versatile", label: "Groq model" },
  "ai.enabled": { secret: false, default: "true", label: "AI features on" },
  "ai.dailyLimit": { secret: false, default: "40", label: "AI requests per couple per day" },
  "ai.guestDailyLimit": { secret: false, default: "150", label: "Guest questions per site per day" },
  "ai.spamFilter": { secret: false, default: "true", label: "AI guestbook spam filter" },
  "pay.enabled": { secret: false, default: "false", label: "Payments on" },
  "pay.amount": { secret: false, default: "1900", label: "Premium price (smallest unit, e.g. cents)" },
  "pay.currency": { secret: false, default: "usd", label: "Currency" },
  "pay.features": { secret: false, default: "ai,guestHelper,password,branding", label: "Premium-only features" },
  "stripe.secretKey": { secret: true, default: "", label: "Stripe secret key" },
  "stripe.webhookSecret": { secret: true, default: "", label: "Stripe webhook signing secret" },
  "site.signupsOpen": { secret: false, default: "true", label: "New sign-ups allowed" },
  "site.announcement": { secret: false, default: "", label: "Dashboard announcement" },
} as const;
export type SettingKey = keyof typeof SETTINGS;

let cache: { at: number; map: Map<string, string> } | null = null;

async function all() {
  if (cache && Date.now() - cache.at < 5_000) return cache.map;
  const rows = await db.setting.findMany();
  cache = { at: Date.now(), map: new Map(rows.map((r) => [r.key, r.value])) };
  return cache.map;
}

export async function getSetting(key: SettingKey): Promise<string> {
  const raw = (await all()).get(key);
  if (raw === undefined) return SETTINGS[key].default;
  return SETTINGS[key].secret ? (decrypt(raw) ?? "") : raw;
}

export const getBool = async (key: SettingKey) => (await getSetting(key)) === "true";
export const getInt = async (key: SettingKey) => Number.parseInt(await getSetting(key), 10) || 0;

export async function setSetting(key: SettingKey, value: string) {
  const stored = SETTINGS[key].secret && value ? encrypt(value) : value;
  await db.setting.upsert({ where: { key }, create: { key, value: stored }, update: { value: stored } });
  cache = null;
}

/** Secrets are never sent back to the browser, only whether they are set (and the last 4 chars). */
export async function settingsForAdmin() {
  const out: Record<string, { value: string; secret: boolean; label: string; set?: boolean }> = {};
  for (const [k, def] of Object.entries(SETTINGS) as [SettingKey, (typeof SETTINGS)[SettingKey]][]) {
    const v = await getSetting(k);
    out[k] = def.secret ? { value: v ? `••••${v.slice(-4)}` : "", secret: true, label: def.label, set: !!v } : { value: v, secret: false, label: def.label };
  }
  return out;
}
