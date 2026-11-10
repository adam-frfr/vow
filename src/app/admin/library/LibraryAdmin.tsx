"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { floralThumb, type Floral } from "@/lib/assets";

const KINDS = ["bouquet", "frame", "wreath", "corner", "border", "garland", "elements", "pattern", "texture"] as const;
const FAMS = ["pink", "red", "purple", "blue", "green", "yellow", "neutral"] as const;

export function LibraryAdmin({ art, hidden }: { art: Floral[]; hidden: string[] }) {
  const router = useRouter();
  const [kind, setKind] = useState("all");
  const [show, setShow] = useState<"all" | "visible" | "hidden" | "mine">("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const hid = useMemo(() => new Set(hidden), [hidden]);

  const list = art.filter(
    (a) =>
      (kind === "all" || a.kind === kind) &&
      (show === "all" || (show === "hidden" ? hid.has(a.id) : show === "visible" ? !hid.has(a.id) : a.custom)) &&
      (!q || `${a.name} ${a.id} ${(a.fam ?? []).join(" ")}`.toLowerCase().includes(q.toLowerCase())),
  );

  async function toggle(a: Floral) {
    setBusy(a.id);
    const res = await fetch("/api/admin/catalog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "art", id: a.id, hidden: !hid.has(a.id) }),
    }).catch(() => null);
    setBusy(null);
    if (!res?.ok) setMsg({ ok: false, text: "Couldn't update that piece." });
    router.refresh();
  }

  async function remove(a: Floral) {
    if (!confirm(`Delete “${a.name}”? Sites that placed it will lose it. Hiding is usually better.`)) return;
    setBusy(a.id);
    const res = await fetch(`/api/admin/art/${a.id}`, { method: "DELETE" }).catch(() => null);
    setBusy(null);
    setMsg(res?.ok ? { ok: true, text: "Deleted." } : { ok: false, text: "Couldn't delete." });
    router.refresh();
  }

  return (
    <>
      <Upload
        onDone={(text, ok) => {
          setMsg({ ok, text });
          if (ok) router.refresh();
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <select className="field !w-auto !py-1.5 text-sm" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="all">All kinds</option>
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
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
              <div className="flex aspect-square items-center justify-center rounded-lg bg-[#f6efe4]">
                <img src={floralThumb(a.id)} alt={a.name} loading="lazy" className="max-h-full max-w-full object-contain p-1" />
              </div>
              <p className="mt-1.5 truncate text-xs" title={a.name}>
                {a.name}
              </p>
              <p className="text-[0.65rem] text-stone">
                {a.kind}
                {a.custom ? " · yours" : ""}
              </p>
              <div className="mt-1.5 flex gap-1">
                <button
                  type="button"
                  disabled={busy === a.id}
                  onClick={() => toggle(a)}
                  className="flex-1 rounded-full border border-line px-2 py-0.5 text-[0.7rem] hover:border-stone disabled:opacity-50"
                >
                  {off ? "Show" : "Hide"}
                </button>
                {a.custom && (
                  <button
                    type="button"
                    disabled={busy === a.id}
                    onClick={() => remove(a)}
                    className="rounded-full border border-red-200 px-2 py-0.5 text-[0.7rem] text-red-700 disabled:opacity-50"
                  >
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

function Upload({ onDone }: { onDone: (text: string, ok: boolean) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<string>("bouquet");
  const [tone, setTone] = useState("any");
  const [fam, setFam] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name || file.name.replace(/\.\w+$/, ""));
    fd.append("kind", kind);
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
      <h2 className="font-serif text-2xl">Add art</h2>
      <p className="mt-1 text-sm text-stone">PNG or WebP with a transparent background, under 4 MB. Painted florals, wreaths and frames work best.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="label">Image</span>
          <input key={inputKey} type="file" accept="image/png,image/webp" className="field" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <label className="block">
          <span className="label">Name</span>
          <input className="field" maxLength={60} placeholder="e.g. Blush peony wreath" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Kind</span>
          <select className="field" value={kind} onChange={(e) => setKind(e.target.value)}>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Works on</span>
          <select className="field" value={tone} onChange={(e) => setTone(e.target.value)}>
            <option value="any">Light and dark pages</option>
            <option value="light">Light pages only (pale art)</option>
          </select>
        </label>
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
