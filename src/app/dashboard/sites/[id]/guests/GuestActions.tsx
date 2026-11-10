"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteRsvp({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="text-xs text-stone underline hover:text-red-700 disabled:opacity-50"
      disabled={busy}
      onClick={async () => {
        if (!confirm(`Remove ${name}'s RSVP? This can't be undone.`)) return;
        setBusy(true);
        await fetch(`/api/rsvps/${id}`, { method: "DELETE" }).catch(() => null);
        router.refresh();
      }}
    >
      Remove
    </button>
  );
}

type WishRow = { id: string; name: string; message: string; hidden: boolean; flagged?: boolean; createdAt: string };

export function WishModeration({ wishes }: { wishes: WishRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function act(id: string, method: "PATCH" | "DELETE", hidden?: boolean) {
    if (method === "DELETE" && !confirm("Delete this guestbook note permanently?")) return;
    setBusy(id);
    await fetch(`/api/wishes/item/${id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "PATCH" ? JSON.stringify({ hidden }) : undefined,
    }).catch(() => null);
    setBusy(null);
    router.refresh();
  }

  if (!wishes.length) return <p className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-stone">No notes yet.</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {wishes.map((w) => (
        <div key={w.id} className={`rounded-2xl border border-line bg-white p-5 ${w.hidden ? "opacity-55" : ""}`}>
          <p className="text-[0.95rem]">{w.message}</p>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <span className="text-stone">
              <b className="font-medium text-ink">{w.name}</b> · {new Date(w.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {w.hidden && (w.flagged ? " · caught by the spam filter" : " · hidden")}
            </span>
            <span className="flex gap-3">
              <button className="underline" disabled={busy === w.id} onClick={() => act(w.id, "PATCH", !w.hidden)}>
                {w.hidden ? "Show" : "Hide"}
              </button>
              <button className="text-red-700 underline" disabled={busy === w.id} onClick={() => act(w.id, "DELETE")}>
                Delete
              </button>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/** AI-drafted thank-you notes, one per guest who replied. */
export function ThankYouNotes({ siteId, hasGuests }: { siteId: string; hasGuests: boolean }) {
  const [notes, setNotes] = useState<{ name: string; note: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  async function run() {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/ai/thanks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ siteId, tone: "warm" }) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    if (!res?.ok) return setErr(data?.error ?? "Couldn't reach the writing assistant.");
    setNotes(data.notes ?? []);
    if (!data.notes?.length) setErr("No notes came back. Try again.");
  }
  if (!hasGuests) return <p className="rounded-2xl border border-dashed border-line bg-white p-6 text-sm text-stone">Once guests RSVP, you can draft a thank-you note for each of them here.</p>;
  return (
    <div className="space-y-4">
      <button className="btn" disabled={busy} onClick={run}>
        ✦ {busy ? "Writing your notes…" : notes.length ? "Write them again" : "Draft thank-you notes with AI"}
      </button>
      {err && <p className="text-sm text-red-700">{err}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {notes.map((n, i) => (
          <div key={i} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-serif text-xl">{n.name}</p>
              <button
                className="text-xs text-stone underline"
                onClick={() => {
                  navigator.clipboard.writeText(n.note);
                  setCopied(i);
                  setTimeout(() => setCopied(null), 1500);
                }}
              >
                {copied === i ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-stone">{n.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
