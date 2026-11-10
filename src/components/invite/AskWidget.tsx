"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { from: "guest" | "helper"; text: string };

const SUGGESTIONS = ["What time should I arrive?", "Is there a dress code?", "Can I bring a plus-one?", "Where should I stay?"];

/** "Ask us anything": guests' questions answered from the couple's own site content. */
export function AskWidget({ slug, names }: { slug: string; names: string }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [msgs, busy]);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy) return;
    setQ("");
    setMsgs((m) => [...m, { from: "guest", text }]);
    setBusy(true);
    const res = await fetch(`/api/ask/${slug}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: text }) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    setMsgs((m) => [...m, { from: "helper", text: res?.ok ? data.answer : (data?.error ?? "Sorry, I couldn't answer that right now.") }]);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] font-sans text-[#1c1917]">
      {open ? (
        <div className="flex h-[min(520px,80svh)] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Ask us anything</p>
              <p className="text-xs text-black/50">Answers from {names}&apos;s wedding details</p>
            </div>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="rounded-full px-2 text-lg text-black/50 hover:bg-black/5">
              ×
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm">
            {msgs.length === 0 && (
              <div className="space-y-2">
                <p className="text-black/60">Hi! Ask about the day, the venue, travel or what to wear.</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-black/10 px-3 py-1 text-xs hover:bg-black/5">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <p
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 ${m.from === "guest" ? "ml-auto bg-[#1c1917] text-white" : "bg-black/[.05]"}`}
              >
                {m.text}
              </p>
            ))}
            {busy && <p className="w-fit rounded-2xl bg-black/[.05] px-3 py-2 text-black/50">…</p>}
            <div ref={end} />
          </div>
          <form
            className="flex gap-2 border-t border-black/5 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              ask(q);
            }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              maxLength={300}
              placeholder="Type a question…"
              className="min-w-0 flex-1 rounded-full border border-black/10 px-4 py-2 text-sm outline-none focus:border-black/30"
            />
            <button type="submit" disabled={busy || !q.trim()} className="rounded-full bg-[#1c1917] px-4 text-sm text-white disabled:opacity-40">
              Ask
            </button>
          </form>
          <p className="pb-2 text-center text-[0.6rem] text-black/40">AI answers can be wrong. Check with the couple for anything important.</p>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-white px-5 py-3 text-sm shadow-xl ring-1 ring-black/5 hover:shadow-2xl">
          Questions? Ask us
        </button>
      )}
    </div>
  );
}
