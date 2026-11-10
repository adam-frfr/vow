"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Design = { id: string; name: string; blurb: string; themes: number };
type Theme = { id: string; name: string; design: string; collection: string; bg: string; accent: string };

export function CatalogAdmin({ designs, themes, hiddenThemes, hiddenDesigns }: { designs: Design[]; themes: Theme[]; hiddenThemes: string[]; hiddenDesigns: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [show, setShow] = useState<"all" | "hidden">("all");
  const [err, setErr] = useState("");

  async function toggle(kind: "themes" | "designs", id: string, hidden: boolean) {
    setBusy(id);
    setErr("");
    const res = await fetch("/api/admin/catalog", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id, hidden }) }).catch(() => null);
    setBusy(null);
    if (!res?.ok) setErr("Couldn't save that change.");
    router.refresh();
  }

  const tList = themes.filter(
    (t) => (show === "all" || hiddenThemes.includes(t.id)) && (!q || `${t.name} ${t.design} ${t.collection} ${t.id}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-8">
      {err && <p className="text-sm text-red-700">{err}</p>}
      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-serif text-2xl">
          Site designs{" "}
          <span className="text-base text-stone">
            ({designs.length - hiddenDesigns.length} shown of {designs.length})
          </span>
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {designs.map((d) => {
            const off = hiddenDesigns.includes(d.id);
            return (
              <div key={d.id} className={`flex items-start gap-3 rounded-xl border p-3 ${off ? "border-dashed border-stone opacity-60" : "border-line"}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="line-clamp-2 text-xs text-stone">{d.blurb}</p>
                  <p className="mt-0.5 text-[0.65rem] text-stone">{d.themes} themes</p>
                </div>
                <button
                  type="button"
                  disabled={busy === d.id}
                  onClick={() => toggle("designs", d.id, !off)}
                  className="shrink-0 rounded-full border border-line px-3 py-1 text-xs hover:border-stone disabled:opacity-50"
                >
                  {off ? "Show" : "Hide"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-serif text-2xl">
          Themes{" "}
          <span className="text-base text-stone">
            ({themes.length - hiddenThemes.length} shown of {themes.length})
          </span>
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <input className="field !w-64 !py-1.5 text-sm" placeholder="Search name, design, collection" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="field !w-auto !py-1.5 text-sm" value={show} onChange={(e) => setShow(e.target.value as typeof show)}>
            <option value="all">All themes</option>
            <option value="hidden">Hidden only</option>
          </select>
        </div>
        <div className="mt-4 divide-y divide-line">
          {tList.map((t) => {
            const off = hiddenThemes.includes(t.id);
            return (
              <div key={t.id} className={`flex items-center gap-3 py-2 ${off ? "opacity-55" : ""}`}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line" style={{ background: t.bg }}>
                  <span className="h-3 w-3 rounded-full" style={{ background: t.accent }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {t.name} {off && <span className="text-xs text-stone">(hidden)</span>}
                  </p>
                  <p className="truncate text-xs text-stone">
                    {t.design} · {t.collection}
                  </p>
                </div>
                <Link href={`/themes/${t.id}`} target="_blank" className="text-xs text-stone underline">
                  View
                </Link>
                <button
                  type="button"
                  disabled={busy === t.id}
                  onClick={() => toggle("themes", t.id, !off)}
                  className="rounded-full border border-line px-3 py-1 text-xs hover:border-stone disabled:opacity-50"
                >
                  {off ? "Show" : "Hide"}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
