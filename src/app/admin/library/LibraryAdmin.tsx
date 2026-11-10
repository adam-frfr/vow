"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArtThumb } from "@/components/ArtThumb";
import { registerArt, type Floral } from "@/lib/assets";
import type { SectionInfo } from "@/lib/catalog-shared";

const KINDS = ["bouquet", "frame", "wreath", "corner", "border", "garland", "elements", "pattern", "texture"] as const;
const FAMS = ["pink", "red", "purple", "blue", "green", "yellow", "neutral"] as const;
const pill = "rounded-full border px-2.5 py-0.5 text-[0.7rem] disabled:opacity-50";
const quiet = `${pill} border-line hover:border-stone`;

type Call = (key: string, url: string, method: string, body?: object, okText?: string) => Promise<boolean>;

export function LibraryAdmin({ art, hidden, sections, payLive }: { art: Floral[]; hidden: string[]; sections: SectionInfo[]; payLive: boolean }) {
  registerArt(art.filter((a) => a.custom));
  const router = useRouter();
  const [where, setWhere] = useState("all");
  const [show, setShow] = useState<"all" | "visible" | "hidden" | "mine">("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const hid = useMemo(() => new Set(hidden), [hidden]);

  const call: Call = async (key, url, method, body, okText) => {
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
  };

  const list = art.filter(
    (a) =>
      (where === "all" || (where.startsWith("sec:") ? a.section === where.slice(4) : !a.section && a.kind === where)) &&
      (show === "all" || (show === "hidden" ? hid.has(a.id) : show === "visible" ? !hid.has(a.id) : a.custom)) &&
      (!q || `${a.name} ${a.id} ${(a.fam ?? []).join(" ")}`.toLowerCase().includes(q.toLowerCase())),
  );

  async function remove(a: Floral) {
    if (!confirm(`Delete “${a.name}”? Sites that placed it will lose it. Hiding is usually better.`)) return;
    await call(a.id, `/api/admin/art/${a.id}`, "DELETE", undefined, "Deleted.");
  }

  return (
    <>
      <Sections sections={sections} art={art} payLive={payLive} busy={busy} call={call} />
      <Upload
        sections={sections}
        onDone={(text, ok) => {
          setMsg({ ok, text });
          if (ok) router.refresh();
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <select className="field !w-auto !py-1.5 text-sm" value={where} onChange={(e) => setWhere(e.target.value)}>
          <option value="all">Everything</option>
          <optgroup label="Your sections">
            {sections.map((s) => (
              <option key={s.id} value={`sec:${s.id}`}>
                {s.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Built-in kinds">
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </optgroup>
        </select>
        <select className="field !w-auto !py-1.5 text-sm" value={show} onChange={(e) => setShow(e.target.value as typeof show)}>
          <option value="all">Shown and hidden</option>
          <option value="visible">Shown only</option>
          <option value="hidden">Hidden only</option>
          <option value="mine">Uploaded by me</option>
        </select>
        <input className="field !w-56 !py-1.5 text-sm" placeholder="Search name or colour" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="text-xs text-stone">{list.length} shown</span>
        {msg && <span className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</span>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {list.map((a) => {
          const off = hid.has(a.id);
          return (
            <div key={a.id} className={`rounded-xl border bg-white p-2 ${off ? "border-dashed border-stone opacity-55" : "border-line"}`}>
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-[#f6efe4]">
                <ArtThumb art={a} className="max-h-full max-w-full object-contain p-1" />
              </div>
              <p className="mt-1.5 truncate text-xs" title={a.name}>
                {a.name}
              </p>
              <p className="truncate text-[0.65rem] text-stone">
                {a.format === "lottie" ? "animation" : a.kind}
                {a.section ? ` · ${sections.find((s) => s.id === a.section)?.name ?? "section"}` : a.custom ? " · yours" : ""}
              </p>
              {a.custom && (
                <select
                  aria-label={`Section for ${a.name}`}
                  className="field mt-1.5 !py-0.5 text-[0.7rem]"
                  value={a.section ?? ""}
                  disabled={busy === a.id}
                  onChange={(e) => call(a.id, `/api/admin/art/${a.id}`, "PATCH", { section: e.target.value || null })}
                >
                  {a.format !== "lottie" && <option value="">Built-in ({a.kind})</option>}
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
              <div className="mt-1.5 flex gap-1">
                <button type="button" disabled={busy === a.id} onClick={() => call(a.id, "/api/admin/catalog", "PATCH", { kind: "art", id: a.id, hidden: !off })} className={`flex-1 ${quiet}`}>
                  {off ? "Show" : "Hide"}
                </button>
                {a.custom && (
                  <button type="button" disabled={busy === a.id} onClick={() => remove(a)} className={`${pill} border-red-200 text-red-700`}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Sections({ sections, art, payLive, busy, call }: { sections: SectionInfo[]; art: Floral[]; payLive: boolean; busy: string | null; call: Call }) {
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const count = (id: string) => art.filter((a) => a.section === id).length;

  async function remove(s: SectionInfo) {
    const n = count(s.id);
    if (!confirm(n ? `Delete “${s.name}” and the ${n} item${n > 1 ? "s" : ""} in it? Sites using them lose them. This can't be undone.` : `Delete the empty section “${s.name}”?`)) return;
    await call(s.id, `/api/admin/sections/${s.id}${n ? "?withItems=1" : ""}`, "DELETE", undefined, "Section deleted.");
  }

  return (
    <section className="rounded-2xl bg-white p-5">
      <h2 className="font-serif text-2xl">Your sections</h2>
      <p className="mt-1 text-sm text-stone">
        Each section is a tab in every couple&apos;s art library, e.g. “Animations” for Lottie files or “Watercolour birds”. Hide one to take it off the site; lock it to make it
        Premium{payLive ? "" : " (applies once payments are on)"}.
      </p>
      {sections.length > 0 && (
        <div className="mt-4 divide-y divide-line">
          {sections.map((s, i) => (
            <div key={s.id} className={`flex flex-wrap items-center gap-2 py-2.5 ${s.hidden ? "opacity-55" : ""}`}>
              {renaming === s.id ? (
                <input className="field !w-56 !py-1 text-sm" value={draft} maxLength={40} onChange={(e) => setDraft(e.target.value)} />
              ) : (
                <p className="min-w-[10rem] flex-1 text-sm">
                  {s.name} <span className="text-xs text-stone">· {count(s.id)} items</span>
                  {s.hidden && <span className="text-xs text-stone"> · hidden</span>}
                  {s.locked && <span className="ml-1.5 rounded-full bg-ink px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-white">Premium</span>}
                </p>
              )}
              {renaming === s.id ? (
                <>
                  <button type="button" className={quiet} onClick={async () => (await call(s.id, `/api/admin/sections/${s.id}`, "PATCH", { name: draft })) && setRenaming(null)}>
                    Save
                  </button>
                  <button type="button" className={quiet} onClick={() => setRenaming(null)}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className={quiet} disabled={i === 0 || busy === s.id} onClick={() => call(s.id, `/api/admin/sections/${s.id}`, "PATCH", { move: "up" })} aria-label={`Move ${s.name} up`}>
                    ↑
                  </button>
                  <button
                    type="button"
                    className={quiet}
                    disabled={i === sections.length - 1 || busy === s.id}
                    onClick={() => call(s.id, `/api/admin/sections/${s.id}`, "PATCH", { move: "down" })}
                    aria-label={`Move ${s.name} down`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={quiet}
                    onClick={() => {
                      setRenaming(s.id);
                      setDraft(s.name);
                    }}
                  >
                    Rename
                  </button>
                  <button type="button" className={quiet} disabled={busy === s.id} onClick={() => call(s.id, `/api/admin/sections/${s.id}`, "PATCH", { hidden: !s.hidden })}>
                    {s.hidden ? "Show" : "Hide"}
                  </button>
                  <button
                    type="button"
                    className={s.locked ? `${pill} border-ink bg-ink text-white` : quiet}
                    disabled={busy === s.id}
                    onClick={() => call(s.id, `/api/admin/sections/${s.id}`, "PATCH", { locked: !s.locked })}
                  >
                    {s.locked ? "Unlock" : "Lock as Premium"}
                  </button>
                  <button type="button" className={`${pill} border-red-200 text-red-700`} disabled={busy === s.id} onClick={() => remove(s)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <form
        className="mt-4 flex flex-wrap gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await call("new-section", "/api/admin/sections", "POST", { name }, `Section “${name}” created. Upload into it below.`)) setName("");
        }}
      >
        <input className="field !w-64 !py-1.5 text-sm" placeholder="New section, e.g. Animations" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className="btn !py-2 text-xs" disabled={name.trim().length < 2 || busy === "new-section"}>
          Add section
        </button>
      </form>
    </section>
  );
}

function Upload({ sections, onDone }: { sections: SectionInfo[]; onDone: (text: string, ok: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [into, setInto] = useState<string>("kind:bouquet");
  const [tone, setTone] = useState("any");
  const [fam, setFam] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const isJson = !!file && /\.json$/i.test(file.name);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    if (isJson && !into.startsWith("sec:")) return onDone("Animations go into one of your sections. Create one (e.g. “Animations”) above, then pick it here.", false);
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name || file.name.replace(/\.\w+$/, ""));
    if (into.startsWith("sec:")) fd.append("section", into.slice(4));
    else fd.append("kind", into.slice(5));
    fd.append("tone", tone);
    fd.append("fam", fam.join(","));
    const res = await fetch("/api/admin/art", { method: "POST", body: fd }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    if (res?.ok) {
      setFile(null);
      setName("");
      setFam([]);
      setInputKey((k) => k + 1);
      onDone("Added to the library. Couples can pick it now.", true);
    } else onDone(data?.error ?? "Upload failed.", false);
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-5">
      <h2 className="font-serif text-2xl">Add art or animations</h2>
      <p className="mt-1 text-sm text-stone">
        PNG or WebP with a transparent background, or a Lottie animation exported as JSON (.json). Under 4 MB. Only upload files you own or are licensed to use on a
        website.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="label">File</span>
          <input key={inputKey} type="file" accept="image/png,image/webp,application/json,.json" className="field" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <label className="block">
          <span className="label">Name</span>
          <input className="field" maxLength={60} placeholder="e.g. Doves flying" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Put it in</span>
          <select className="field" value={into} onChange={(e) => setInto(e.target.value)}>
            {sections.length > 0 && (
              <optgroup label="Your sections">
                {sections.map((s) => (
                  <option key={s.id} value={`sec:${s.id}`}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="Built-in kinds (images only)">
              {KINDS.map((k) => (
                <option key={k} value={`kind:${k}`}>
                  {k}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        {!isJson && (
          <label className="block">
            <span className="label">Works on</span>
            <select className="field" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="any">Light and dark pages</option>
              <option value="light">Light pages only (pale art)</option>
            </select>
          </label>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="label !mb-0">Colours</span>
        {FAMS.map((f) => (
          <label key={f} className="flex items-center gap-1">
            <input type="checkbox" checked={fam.includes(f)} onChange={(e) => setFam((x) => (e.target.checked ? [...x, f].slice(0, 4) : x.filter((y) => y !== f)))} />
            {f}
          </label>
        ))}
      </div>
      <button type="submit" className="btn mt-4" disabled={!file || busy}>
        {busy ? "Uploading…" : "Add to library"}
      </button>
    </form>
  );
}
