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

type WishRow = { id: string; name: string; message: string; hidden: boolean; createdAt: string };

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
              {w.hidden && " · hidden"}
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
