"use client";

import { useState } from "react";

type S = Record<string, { value: string; secret: boolean; label: string; set?: boolean }>;

const MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];
const FEATURES: [string, string][] = [
  ["ai", "AI writing assistant & theme matchmaker"],
  ["guestHelper", "“Ask us anything” guest helper"],
  ["password", "Password-protected site"],
  ["branding", "Remove “Made with Vow”"],
];

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5">
      <h2 className="font-serif text-2xl">{title}</h2>
      {hint && <p className="mt-1 max-w-2xl text-sm text-stone">{hint}</p>}
      <div className="mt-4 grid max-w-2xl gap-4">{children}</div>
    </section>
  );
}

export function SettingsForm({ initial }: { initial: S }) {
  const [s, setS] = useState(initial);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const val = (k: string) => (k in draft ? draft[k] : s[k]?.secret ? "" : (s[k]?.value ?? ""));
  const set = (k: string, v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const on = (k: string) => val(k) === "true";

  async function save(patch: Record<string, string> = draft) {
    setMsg(null);
    const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok) return setMsg({ ok: false, text: data?.error ?? "Couldn't save." });
    setS(data);
    setDraft({});
    setMsg({ ok: true, text: "Saved." });
  }

  async function test() {
    setTesting(true);
    setMsg(null);
    const res = await fetch("/api/admin/test-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: draft["groq.apiKey"] || undefined, model: val("groq.model") }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setTesting(false);
    setMsg(res?.ok ? { ok: true, text: "Groq is connected and the model replied. Remember to save." } : { ok: false, text: data?.error ?? "Test failed." });
  }

  const secret = (k: string, placeholder: string) => (
    <label className="block">
      <span className="label">{s[k].label}</span>
      <div className="flex gap-2">
        <input
          type="password"
          autoComplete="off"
          className="field"
          placeholder={s[k].set ? `Saved (${s[k].value}). Type to replace.` : placeholder}
          value={draft[k] ?? ""}
          onChange={(e) => set(k, e.target.value)}
        />
        {s[k].set && (
          <button type="button" className="btn btn-light !px-3 !py-2 text-xs" onClick={() => confirm(`Remove the saved ${s[k].label}?`) && save({ [k]: "" })}>
            Remove
          </button>
        )}
      </div>
    </label>
  );
  const toggle = (k: string, label: string, hint?: string) => (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3">
      <input type="checkbox" className="mt-1" checked={on(k)} onChange={(e) => set(k, e.target.checked ? "true" : "false")} />
      <span>
        <span className="block text-sm">{label}</span>
        {hint && <span className="block text-xs text-stone">{hint}</span>}
      </span>
    </label>
  );
  const features = val("pay.features").split(",").filter(Boolean);
  const dirty = Object.keys(draft).length > 0;

  return (
    <div className="space-y-6 pb-24">
      <Section
        title="AI (Groq)"
        hint="Powers the writing assistant, theme matchmaker, guest helper, translation, thank-you notes and the guestbook spam filter. Get a key at console.groq.com → API Keys. It is stored encrypted and never shown again."
      >
        {secret("groq.apiKey", "gsk_…")}
        <label className="block">
          <span className="label">Model</span>
          <input className="field" list="groq-models" value={val("groq.model")} onChange={(e) => set("groq.model", e.target.value)} />
          <datalist id="groq-models">
            {MODELS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <span className="mt-1 block text-xs text-stone">llama-3.3-70b-versatile writes best; llama-3.1-8b-instant is fastest and cheapest.</span>
        </label>
        <div>
          <button type="button" className="btn btn-light" disabled={testing} onClick={test}>
            {testing ? "Testing…" : "Test connection"}
          </button>
        </div>
        {toggle("ai.enabled", "AI features on", "Switch everything AI off instantly.")}
        {toggle("ai.spamFilter", "AI guestbook spam filter", "New guestbook messages are checked; spam is hidden and listed under Spam & abuse.")}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">{s["ai.dailyLimit"].label}</span>
            <input className="field" inputMode="numeric" value={val("ai.dailyLimit")} onChange={(e) => set("ai.dailyLimit", e.target.value)} />
          </label>
          <label className="block">
            <span className="label">{s["ai.guestDailyLimit"].label}</span>
            <input className="field" inputMode="numeric" value={val("ai.guestDailyLimit")} onChange={(e) => set("ai.guestDailyLimit", e.target.value)} />
          </label>
        </div>
      </Section>

      <Section
        title="Payments (Stripe)"
        hint="While payments are off, every feature is free. Turn them on to sell a one-time Premium upgrade per wedding site. In Stripe: Developers → API keys for the secret key; Developers → Webhooks → add endpoint https://YOUR-DOMAIN/api/pay/webhook with the event checkout.session.completed for the signing secret."
      >
        {toggle("pay.enabled", "Payments on")}
        {secret("stripe.secretKey", "sk_test_… or sk_live_…")}
        {secret("stripe.webhookSecret", "whsec_…")}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">Price</span>
            <input
              className="field"
              inputMode="decimal"
              value={(Number(val("pay.amount")) / 100).toString()}
              onChange={(e) => set("pay.amount", String(Math.round(Number(e.target.value.replace(/[^\d.]/g, "")) * 100) || 0))}
            />
          </label>
          <label className="block">
            <span className="label">Currency</span>
            <select className="field" value={val("pay.currency")} onChange={(e) => set("pay.currency", e.target.value)}>
              {["usd", "eur", "gbp", "inr", "aud", "cad", "sgd", "aed"].map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <span className="label">Premium-only features</span>
          <div className="grid gap-2">
            {FEATURES.map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={features.includes(k)}
                  onChange={(e) => set("pay.features", (e.target.checked ? [...features, k] : features.filter((f) => f !== k)).join(","))}
                />
                {l}
              </label>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Website">
        {toggle("site.signupsOpen", "New sign-ups allowed", "Turn off to pause new accounts (existing couples can still sign in).")}
        <label className="block">
          <span className="label">{s["site.announcement"].label}</span>
          <input className="field" placeholder="Shown at the top of every couple's dashboard" value={val("site.announcement")} onChange={(e) => set("site.announcement", e.target.value)} />
        </label>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-5 py-3 backdrop-blur lg:left-60">
        <div className="flex max-w-2xl items-center gap-4">
          <button type="button" className="btn" disabled={!dirty} onClick={() => save()}>
            Save changes
          </button>
          {dirty && (
            <button type="button" className="text-sm text-stone underline" onClick={() => setDraft({})}>
              Discard
            </button>
          )}
          {msg && <span className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</span>}
        </div>
      </div>
    </div>
  );
}
