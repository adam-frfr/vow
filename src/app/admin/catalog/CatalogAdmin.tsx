"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CollectionInfo } from "@/lib/catalog-shared";

type Design = { id: string; name: string; blurb: string; themes: number };
type Theme = { id: string; name: string; design: string; collection: string; bg: string; accent: string; builder: string | null; sites: number };

const pill = "rounded-full border px-3 py-1 text-xs disabled:opacity-50";
const quiet = `${pill} border-line hover:border-stone`;
const dark = `${pill} border-ink bg-ink text-white`;

export function CatalogAdmin({
  collections,
  designs,
  themes,
  hiddenThemes,
  hiddenDesigns,
  locked,
  payLive,
}: {
  collections: CollectionInfo[];
  designs: Design[];
  themes: Theme[];
  hiddenThemes: string[];
  hiddenDesigns: string[];
  locked: { themes: string[]; designs: string[] };
  payLive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [q, setQ] = useState("");
  const [show, setShow] = useState<"all" | "hidden" | "locked" | "mine" | "drafts">("all");
  const [inCollection, setInCollection] = useState("all");

  async function call(key: string, url: string, method: string, body?: object, okText?: string) {
    setBusy(key);
    setMsg(null);
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(null);
    if (!res?.ok) {
      setMsg({ ok: false, text: data?.error ?? "Couldn't save that change." });
      return false;
    }
    if (okText) setMsg({ ok: true, text: okText });
    router.refresh();
    return true;
  }

  const name = (id: string) => collections.find((c) => c.id === id)?.name ?? id;
  const tList = themes.filter(
    (t) =>
      (show === "all" ||
        (show === "hidden" && hiddenThemes.includes(t.id)) ||
        (show === "locked" && locked.themes.includes(t.id)) ||
        (show === "mine" && t.builder) ||
        (show === "drafts" && t.builder === "draft")) &&
      (inCollection === "all" || t.collection === inCollection) &&
      (!q || `${t.name} ${t.design} ${name(t.collection)} ${t.id}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-8">
      {!payLive && (
        <p className="rounded-xl bg-white px-4 py-3 text-sm text-stone">
          Payments are off, so Premium locks are saved but not enforced: everything stays free until you turn payments on under Settings.
        </p>
      )}
      {msg && <p className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</p>}

      <Collections collections={collections} themes={themes} busy={busy} call={call} />

      <section className="rounded-2xl bg-white p-5">
        <h2 className="font-serif text-2xl">
          Site designs <span className="text-base text-stone">({designs.length - hiddenDesigns.length} shown of {designs.length})</span>
        </h2>
        <p className="mt-1 text-sm text-stone">Hiding a design hides every theme built on it. Locking makes the design (and its themes) Premium-only.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {designs.map((d) => {
            const off = hiddenDesigns.includes(d.id);
            const lock = locked.designs.includes(d.id);
            return (
              <div key={d.id} className={`rounded-xl border p-3 ${off ? "border-dashed border-stone opacity-60" : "border-line"}`}>
                <p className="text-sm font-medium">
                  {d.name} {lock && <span className="ml-1 rounded-full bg-ink px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-white">Premium</span>}
                </p>
                <p className="line-clamp-2 text-xs text-stone">{d.blurb}</p>
                <p className="mt-0.5 text-[0.65rem] text-stone">{d.themes} themes</p>
                <div className="mt-2 flex gap-1.5">
                  <button type="button" disabled={busy === d.id} className={quiet} onClick={() => call(d.id, "/api/admin/catalog", "PATCH", { kind: "designs", id: d.id, hidden: !off })}>
                    {off ? "Show" : "Hide"}
                  </button>
                  <button type="button" disabled={busy === d.id} className={lock ? dark : quiet} onClick={() => call(d.id, "/api/admin/catalog/lock", "PATCH", { target: "designs", id: d.id, locked: !lock })}>
                    {lock ? "Unlock" : "Lock as Premium"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-2xl">
            Themes <span className="text-base text-stone">({themes.length - hiddenThemes.length} shown of {themes.length})</span>
          </h2>
          <Link href="/admin/themes/new" className="btn btn-light !py-2 text-xs">
            New theme
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input className="field !w-64 !py-1.5 text-sm" placeholder="Search name, design, collection" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="field !w-auto !py-1.5 text-sm" value={show} onChange={(e) => setShow(e.target.value as typeof show)}>
            <option value="all">All themes</option>
            <option value="mine">Made by me</option>
            <option value="drafts">My drafts</option>
            <option value="hidden">Hidden</option>
            <option value="locked">Premium-locked</option>
          </select>
          <select className="field !w-auto !py-1.5 text-sm" value={inCollection} onChange={(e) => setInCollection(e.target.value)}>
            <option value="all">Every collection</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="self-center text-xs text-stone">{tList.length} listed</span>
        </div>
        <div className="mt-4 divide-y divide-line">
          {tList.map((t) => {
            const off = hiddenThemes.includes(t.id);
            const lock = locked.themes.includes(t.id);
            const draft = t.builder === "draft";
            return (
              <div key={t.id} className={`flex flex-wrap items-center gap-2 py-2.5 ${off ? "opacity-55" : ""}`}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line" style={{ background: t.bg }}>
                  <span className="h-3 w-3 rounded-full" style={{ background: t.accent }} />
                </span>
                <div className="min-w-[10rem] flex-1">
                  <p className="truncate text-sm">
                    {t.name}
                    {t.builder && <span className="ml-1.5 text-[0.65rem] text-stone">{draft ? "· draft" : "· yours"}</span>}
                    {off && <span className="ml-1.5 text-[0.65rem] text-stone">· hidden</span>}
                    {lock && <span className="ml-1.5 rounded-full bg-ink px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-white">Premium</span>}
                  </p>
                  <p className="truncate text-xs text-stone">
                    {t.design} · {t.sites} site{t.sites === 1 ? "" : "s"}
                  </p>
                </div>
                <select
                  aria-label={`Collection for ${t.name}`}
                  className="field !w-40 !py-1 text-xs"
                  value={t.collection}
                  disabled={busy === t.id}
                  onChange={(e) => call(t.id, "/api/admin/catalog/move", "PATCH", { id: t.id, collection: e.target.value })}
                >
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Link href={`/themes/${t.id}`} target="_blank" className="text-xs text-stone underline">
                  {draft ? "Preview" : "View"}
                </Link>
                {t.builder ? (
                  <>
                    <Link href={`/admin/themes/${t.id}`} className={quiet}>
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={busy === t.id}
                      className={draft ? dark : quiet}
                      onClick={() => call(t.id, `/api/admin/themes/${t.id}`, "PATCH", { status: draft ? "published" : "draft" }, draft ? `Published “${t.name}”.` : `“${t.name}” is a draft again.`)}
                    >
                      {draft ? "Publish" : "Unpublish"}
                    </button>
                  </>
                ) : (
                  <Link href={`/admin/themes/new?from=${t.id}`} className={quiet}>
                    Duplicate
                  </Link>
                )}
                <button type="button" disabled={busy === t.id} className={quiet} onClick={() => call(t.id, "/api/admin/catalog", "PATCH", { kind: "themes", id: t.id, hidden: !off })}>
                  {off ? "Show" : "Hide"}
                </button>
                <button type="button" disabled={busy === t.id} className={lock ? dark : quiet} onClick={() => call(t.id, "/api/admin/catalog/lock", "PATCH", { target: "themes", id: t.id, locked: !lock })}>
                  {lock ? "Unlock" : "Lock"}
                </button>
                {t.builder && (
                  <button
                    type="button"
                    disabled={busy === t.id}
                    className={`${pill} border-red-200 text-red-700`}
                    onClick={() => confirm(`Delete “${t.name}”? This can't be undone.`) && call(t.id, `/api/admin/themes/${t.id}`, "DELETE", undefined, "Deleted.")}
                  >
                    Delete
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Collections({
  collections,
  themes,
  busy,
  call,
}: {
  collections: CollectionInfo[];
  themes: Theme[];
  busy: string | null;
  call: (key: string, url: string, method: string, body?: object, okText?: string) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [blurb, setBlurb] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", blurb: "" });
  const count = (id: string) => themes.filter((t) => t.collection === id).length;

  return (
    <section className="rounded-2xl bg-white p-5">
      <h2 className="font-serif text-2xl">
        Collections <span className="text-base text-stone">({collections.filter((c) => !c.hidden).length} shown of {collections.length})</span>
      </h2>
      <p className="mt-1 text-sm text-stone">The tabs in the theme gallery, in this order. Hiding a collection hides its themes.</p>
      <div className="mt-4 divide-y divide-line">
        {collections.map((c, i) => (
          <div key={c.id} className={`flex flex-wrap items-center gap-2 py-2.5 ${c.hidden ? "opacity-55" : ""}`}>
            {editing === c.id ? (
              <div className="grid flex-1 gap-2 sm:grid-cols-[14rem_1fr]">
                <input className="field !py-1.5 text-sm" value={draft.name} maxLength={40} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                <input className="field !py-1.5 text-sm" value={draft.blurb} maxLength={160} placeholder="Short description" onChange={(e) => setDraft({ ...draft, blurb: e.target.value })} />
              </div>
            ) : (
              <div className="min-w-[10rem] flex-1">
                <p className="text-sm">
                  {c.name} {c.custom && <span className="text-[0.65rem] text-stone">· yours</span>} {c.hidden && <span className="text-[0.65rem] text-stone">· hidden</span>}
                </p>
                <p className="truncate text-xs text-stone">
                  {count(c.id)} themes{c.blurb ? ` · ${c.blurb}` : ""}
                </p>
              </div>
            )}
            {editing === c.id ? (
              <>
                <button
                  type="button"
                  className={dark}
                  disabled={busy === c.id}
                  onClick={async () => (await call(c.id, "/api/admin/collections", "PATCH", { id: c.id, ...draft })) && setEditing(null)}
                >
                  Save
                </button>
                <button type="button" className={quiet} onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button type="button" className={quiet} disabled={i === 0 || busy === c.id} onClick={() => call(c.id, "/api/admin/collections", "PATCH", { id: c.id, move: "up" })} aria-label={`Move ${c.name} up`}>
                  ↑
                </button>
                <button
                  type="button"
                  className={quiet}
                  disabled={i === collections.length - 1 || busy === c.id}
                  onClick={() => call(c.id, "/api/admin/collections", "PATCH", { id: c.id, move: "down" })}
                  aria-label={`Move ${c.name} down`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={quiet}
                  onClick={() => {
                    setEditing(c.id);
                    setDraft({ name: c.name, blurb: c.blurb });
                  }}
                >
                  Rename
                </button>
                <button type="button" className={quiet} disabled={busy === c.id} onClick={() => call(c.id, "/api/admin/collections", "PATCH", { id: c.id, hidden: !c.hidden })}>
                  {c.hidden ? "Show" : "Hide"}
                </button>
                {c.custom && (
                  <button
                    type="button"
                    className={`${pill} border-red-200 text-red-700`}
                    disabled={busy === c.id}
                    onClick={() => confirm(`Delete the collection “${c.name}”?`) && call(c.id, `/api/admin/collections?id=${encodeURIComponent(c.id)}`, "DELETE", undefined, "Collection deleted.")}
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <form
        className="mt-4 grid gap-2 sm:grid-cols-[14rem_1fr_auto]"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await call("new-collection", "/api/admin/collections", "POST", { name, blurb }, `Collection “${name}” created.`)) {
            setName("");
            setBlurb("");
          }
        }}
      >
        <input className="field !py-1.5 text-sm" placeholder="New collection name" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        <input className="field !py-1.5 text-sm" placeholder="Short description (optional)" maxLength={160} value={blurb} onChange={(e) => setBlurb(e.target.value)} />
        <button type="submit" className="btn !py-2 text-xs" disabled={name.trim().length < 2 || busy === "new-collection"}>
          Add collection
        </button>
      </form>
    </section>
  );
}
