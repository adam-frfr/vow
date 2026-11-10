"use client";

import { createContext, useContext, useState } from "react";
import { getTheme } from "@/lib/themes";

/** The site being edited, so AI buttons anywhere in the editor know where to send requests. */
export const AiSite = createContext<string>("");

const TONES = [
  ["warm", "Warm"],
  ["romantic", "Romantic"],
  ["playful", "Playful"],
  ["formal", "Formal"],
  ["simple", "Simple"],
] as const;
const REWRITES = [
  ["shorter", "Shorter"],
  ["warmer", "Warmer"],
  ["formal", "More formal"],
  ["playful", "More playful"],
  ["fix", "Fix grammar"],
] as const;
type Tone = (typeof TONES)[number][0];

export async function callAi<T>(url: string, body: object): Promise<{ data?: T; error?: string; premium?: boolean }> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
  const data = await res?.json().catch(() => null);
  if (!res?.ok) return { error: data?.error ?? "Couldn't reach the writing assistant. Check your connection.", premium: data?.code === "premium" };
  return { data: data as T };
}

function Chips<K extends string>({ items, value, onPick }: { items: readonly (readonly [K, string])[]; value?: K; onPick: (k: K) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(([k, l]) => (
        <button
          key={k}
          type="button"
          onClick={() => onPick(k)}
          className={`rounded-full border px-2.5 py-1 text-xs ${value === k ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-stone"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function AiError({ error, premium }: { error: string; premium?: boolean }) {
  return (
    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
      {error}
      {premium && (
        <a href="#upgrade" className="ml-1 underline" onClick={() => document.getElementById("upgrade")?.scrollIntoView({ behavior: "smooth" })}>
          See Premium
        </a>
      )}
    </p>
  );
}

/**
 * "Write with AI" for one text field: draft it from the wedding details, or rewrite
 * what's there. Nothing changes until the couple presses "Use this".
 */
export function AiButton({ field, value, onApply }: { field: string; value: string; onApply: (v: string) => void }) {
  const siteId = useContext(AiSite);
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<Tone>("warm");
  const [answers, setAnswers] = useState({ howMet: "", proposal: "", extra: "" });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [err, setErr] = useState<{ error: string; premium?: boolean } | null>(null);
  const [last, setLast] = useState<object | null>(null);

  async function run(body: object) {
    setBusy(true);
    setErr(null);
    setLast(body);
    const r = await callAi<{ text: string }>("/api/ai/write", { siteId, field, ...body });
    setBusy(false);
    if (r.error) return setErr({ error: r.error, premium: r.premium });
    if (!r.data?.text) return setErr({ error: "Nothing came back. Try again." });
    setResult(r.data.text);
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs text-[#7a5a2a] hover:underline">
        <span aria-hidden>✦</span> Write with AI
      </button>
    );
  }
  return (
    <div className="mt-2 space-y-3 rounded-xl border border-[#e8dcc4] bg-[#fdf9f1] p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#7a5a2a]">✦ Writing assistant</span>
        <button type="button" className="text-xs text-stone underline" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
      <Chips items={TONES} value={tone} onPick={setTone} />
      {field === "story" && (
        <div className="space-y-2">
          <textarea className="field min-h-16 !text-sm" placeholder="How did you meet?" value={answers.howMet} onChange={(e) => setAnswers({ ...answers, howMet: e.target.value })} />
          <textarea className="field min-h-16 !text-sm" placeholder="How did the proposal happen?" value={answers.proposal} onChange={(e) => setAnswers({ ...answers, proposal: e.target.value })} />
          <textarea className="field min-h-12 !text-sm" placeholder="Anything else? (a first date, a pet, an inside joke…)" value={answers.extra} onChange={(e) => setAnswers({ ...answers, extra: e.target.value })} />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={busy} className="btn !px-4 !py-2 text-xs" onClick={() => run({ mode: "draft", tone, answers: field === "story" ? answers : undefined })}>
          {busy ? "Writing…" : value.trim() ? "Write a new version" : "Write it for me"}
        </button>
      </div>
      {value.trim() && (
        <div>
          <p className="mb-1 text-[0.65rem] uppercase tracking-wider text-stone">Or improve what you wrote</p>
          <Chips items={REWRITES} onPick={(how) => run({ mode: "rewrite", how, text: value })} />
        </div>
      )}
      {err && <AiError {...err} />}
      {result && !busy && (
        <div className="space-y-2">
          <p className="whitespace-pre-wrap rounded-lg bg-white p-3 text-sm">{result}</p>
          <p className="text-[0.65rem] text-stone">Check names and details before using it. [Brackets] mark things only you know.</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn !px-4 !py-2 text-xs"
              onClick={() => {
                onApply(result);
                setResult("");
                setOpen(false);
              }}
            >
              Use this
            </button>
            <button type="button" className="btn btn-light !px-4 !py-2 text-xs" onClick={() => last && run(last)}>
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Suggest FAQ questions and answers from the wedding details. */
export function FaqAi({ onAdd }: { onAdd: (items: { q: string; a: string }[]) => void }) {
  const siteId = useContext(AiSite);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<{ q: string; a: string }[]>([]);
  const [pick, setPick] = useState<Set<number>>(new Set());
  const [err, setErr] = useState<{ error: string; premium?: boolean } | null>(null);
  async function run() {
    setBusy(true);
    setErr(null);
    const r = await callAi<{ items: { q: string; a: string }[] }>("/api/ai/write", { siteId, field: "faq", mode: "draft", tone: "warm" });
    setBusy(false);
    if (r.error) return setErr({ error: r.error, premium: r.premium });
    setItems(r.data?.items ?? []);
    setPick(new Set((r.data?.items ?? []).map((_, i) => i)));
  }
  return (
    <div className="space-y-2">
      <button type="button" disabled={busy} onClick={run} className="inline-flex items-center gap-1 text-xs text-[#7a5a2a] hover:underline">
        <span aria-hidden>✦</span> {busy ? "Thinking of questions…" : "Suggest questions with AI"}
      </button>
      {err && <AiError {...err} />}
      {items.length > 0 && (
        <div className="space-y-2 rounded-xl border border-[#e8dcc4] bg-[#fdf9f1] p-3">
          {items.map((it, i) => (
            <label key={i} className="flex gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={pick.has(i)}
                onChange={(e) => {
                  const n = new Set(pick);
                  if (e.target.checked) n.add(i);
                  else n.delete(i);
                  setPick(n);
                }}
              />
              <span>
                <b className="block">{it.q}</b>
                <span className="text-stone">{it.a}</span>
              </span>
            </label>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              className="btn !px-4 !py-2 text-xs"
              disabled={pick.size === 0}
              onClick={() => {
                onAdd(items.filter((_, i) => pick.has(i)));
                setItems([]);
              }}
            >
              Add {pick.size} to my FAQ
            </button>
            <button type="button" className="btn btn-light !px-4 !py-2 text-xs" onClick={() => setItems([])}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Describe the wedding, get three matching themes. */
export function ThemeMatch({ onPick }: { onPick: (id: string) => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [picks, setPicks] = useState<{ id: string; why: string }[]>([]);
  const [err, setErr] = useState("");
  async function run() {
    setBusy(true);
    setErr("");
    const r = await callAi<{ picks: { id: string; why: string }[] }>("/api/ai/match", { description: text });
    setBusy(false);
    if (r.error) return setErr(r.error);
    if (!r.data?.picks.length) return setErr("No matches came back. Try describing it a little differently.");
    setPicks(r.data.picks);
  }
  return (
    <div className="space-y-3 rounded-2xl border border-[#e8dcc4] bg-[#fdf9f1] p-4">
      <p className="text-sm font-medium text-[#7a5a2a]">✦ Find my theme with AI</p>
      <textarea
        className="field min-h-20 !text-sm"
        placeholder="Describe your wedding: e.g. an autumn barn wedding in burgundy and gold, a bit vintage, about 80 guests"
        value={text}
        maxLength={600}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="button" className="btn !px-4 !py-2 text-xs" disabled={busy || text.trim().length < 8} onClick={run}>
        {busy ? "Matching…" : "Match me"}
      </button>
      {err && <p className="text-xs text-red-700">{err}</p>}
      {picks.length > 0 && (
        <div className="grid gap-2">
          {picks.map((p) => {
            const t = getTheme(p.id);
            return (
              <button key={p.id} type="button" onClick={() => onPick(p.id)} className="flex items-start gap-3 rounded-xl border border-line bg-white p-2 text-left hover:border-ink">
                <span className="mt-0.5 flex shrink-0 -space-x-1">
                  {[t.palette.bg, t.palette.accent, t.palette.text].map((c, i) => (
                    <span key={i} className="h-4 w-4 rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,.08)]" style={{ background: c }} />
                  ))}
                </span>
                <span>
                  <b className="block text-sm">{t.name}</b>
                  <span className="text-xs text-stone">{p.why}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const LANGUAGES = ["Spanish", "French", "Italian", "German", "Portuguese", "Hindi", "Urdu", "Arabic", "Bengali", "Tamil", "Malayalam", "Chinese (Simplified)", "Japanese", "Korean", "Tagalog", "Polish", "Dutch", "Greek", "Turkish", "Russian", "Vietnamese", "Indonesian"];

type Tr = { lang: string; fields: Record<string, unknown> };

/** Second language: translate the site's wording; guests switch with a button on the live site. */
export function TranslatePanel({ translation, onChange }: { translation?: Tr; onChange: (t: Tr | undefined) => void }) {
  const siteId = useContext(AiSite);
  const [lang, setLang] = useState(translation?.lang ?? "Spanish");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<{ error: string; premium?: boolean } | null>(null);
  async function run() {
    setBusy(true);
    setErr(null);
    const r = await callAi<{ translation: Tr }>("/api/ai/translate", { siteId, language: lang });
    setBusy(false);
    if (r.error) return setErr({ error: r.error, premium: r.premium });
    onChange(r.data!.translation);
  }
  return (
    <div className="space-y-3">
      {translation && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Your site is also in <b>{translation.lang}</b>. Guests see a language button at the top.
        </p>
      )}
      <div className="flex gap-2">
        <select className="field" value={lang} onChange={(e) => setLang(e.target.value)}>
          {LANGUAGES.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </select>
        <button type="button" className="btn shrink-0 !px-4 !py-2 text-xs" disabled={busy} onClick={run}>
          {busy ? "Translating…" : translation ? "Re-translate" : "Translate"}
        </button>
      </div>
      <p className="text-xs text-stone">Translates your headline, story, travel, dress code, registry, FAQ, RSVP note and section titles. Re-translate after you edit your wording.</p>
      {err && <AiError {...err} />}
      {translation && (
        <button type="button" className="text-xs text-stone underline" onClick={() => onChange(undefined)}>
          Remove the second language
        </button>
      )}
    </div>
  );
}
