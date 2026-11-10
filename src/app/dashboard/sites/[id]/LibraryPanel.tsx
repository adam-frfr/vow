"use client";

import { useCatalog } from "@/components/CatalogProvider";
import { artLocked, visibleArt } from "@/lib/catalog-shared";
import { ArtThumb } from "@/components/ArtThumb";
import { useMemo, useState } from "react";
import { getFloral, type Family, type FloralKind } from "@/lib/assets";
import { floralFamilies } from "@/lib/decor";
import { STICKER_ANIMS, type Sticker, type StickerAnim } from "@/lib/stickers";

const KINDS: { id: "all" | FloralKind | "edges"; label: string; kinds?: FloralKind[] }[] = [
  { id: "all", label: "All" },
  { id: "bouquet", label: "Bouquets & stems", kinds: ["bouquet", "elements"] },
  { id: "wreath", label: "Wreaths", kinds: ["wreath"] },
  { id: "frame", label: "Frames", kinds: ["frame"] },
  { id: "edges", label: "Corners & borders", kinds: ["corner", "border", "garland"] },
];

const FAMILIES: { id: Family; label: string; swatch: string }[] = [
  { id: "pink", label: "Blush & pink", swatch: "#e9a3b4" },
  { id: "red", label: "Red & burgundy", swatch: "#9b2335" },
  { id: "purple", label: "Lilac & plum", swatch: "#9a7bb8" },
  { id: "blue", label: "Blue", swatch: "#7c9cc9" },
  { id: "green", label: "Greenery", swatch: "#7d9a6f" },
  { id: "yellow", label: "Yellow, peach & gold", swatch: "#e2b25a" },
  { id: "neutral", label: "Ivory & neutral", swatch: "#d9d0c3" },
];

const STICKERABLE: FloralKind[] = ["bouquet", "elements", "wreath", "frame", "corner", "border", "garland"];

export function LibraryPanel({
  stickers,
  selected,
  dark,
  premium,
  onAdd,
  onChange,
  onSelect,
  onDelete,
  onDuplicate,
  onReorder,
  onClear,
}: {
  stickers: Sticker[];
  selected: string | null;
  dark: boolean;
  premium: boolean;
  onAdd: (asset: string) => void;
  onChange: (s: Sticker) => void;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onReorder: (id: string, to: "front" | "back") => void;
  onClear: () => void;
}) {
  const [kind, setKind] = useState<string>("all");
  const [fam, setFam] = useState<Family | null>(null);
  const [q, setQ] = useState("");
  const cat = useCatalog();
  const sections = cat.sections.filter((x) => !x.hidden);
  const [lockMsg, setLockMsg] = useState("");
  const items = useMemo(() => {
    const section = kind.startsWith("sec:") ? kind.slice(4) : null;
    const k = KINDS.find((x) => x.id === kind)?.kinds ?? STICKERABLE;
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return visibleArt(cat).filter(
      (f) =>
        (section ? f.section === section : k.includes(f.kind) || (kind === "all" && !!f.section)) &&
        (!fam || floralFamilies(f).includes(fam)) &&
        words.every((w) => f.name.toLowerCase().includes(w) || f.kind.includes(w) || floralFamilies(f).some((x) => x.includes(w))),
    );
  }, [kind, fam, q, cat]);
  const sel = stickers.find((s) => s.id === selected);
  const selArt = sel && getFloral(sel.asset);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl">Art library</h3>
        <p className="mt-0.5 text-xs text-stone">
          Hand-painted florals you can put anywhere. Tap one to add it, then drag it around the preview. Use the round handles to resize and turn it.
        </p>
      </div>

      {sel && selArt && (
        <div className="sticky -top-5 z-10 -mx-1 space-y-3 rounded-2xl border-2 border-[#2f6fed]/40 bg-[#f5f8ff] p-4 shadow-[0_10px_24px_-14px_rgba(0,0,0,.35)]">
          <div className="flex items-center gap-3">
            <ArtThumb art={selArt} className="h-12 w-12 rounded-lg bg-white object-contain p-1" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{selArt.name}</p>
              <p className="text-xs text-stone">Selected · arrow keys nudge, Delete removes</p>
            </div>
            <button type="button" className="text-xs text-stone underline" onClick={() => onSelect(null)}>
              Done
            </button>
          </div>
          <Slider label="Size" min={3} max={100} step={0.5} value={sel.w} onChange={(w) => onChange({ ...sel, w })} suffix="%" />
          <Slider label="Rotation" min={-180} max={180} step={1} value={sel.r ?? 0} onChange={(r) => onChange({ ...sel, r })} suffix="°" />
          <Slider label="Opacity" min={10} max={100} step={1} value={Math.round((sel.o ?? 1) * 100)} onChange={(o) => onChange({ ...sel, o: o / 100 })} suffix="%" />
          <label className="block">
            <span className="label">Animation</span>
            <select className="field" value={sel.anim ?? "none"} onChange={(e) => onChange({ ...sel, anim: e.target.value as StickerAnim })}>
              {(Object.keys(STICKER_ANIMS) as StickerAnim[]).map((k) => (
                <option key={k} value={k}>
                  {STICKER_ANIMS[k]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <Chip on={!!sel.flip} onClick={() => onChange({ ...sel, flip: !sel.flip })}>
              Mirror
            </Chip>
            <Chip on={!!sel.hideMobile} onClick={() => onChange({ ...sel, hideMobile: !sel.hideMobile })}>
              Hide on phones
            </Chip>
            <Chip onClick={() => onReorder(sel.id, "front")}>Bring to front</Chip>
            <Chip onClick={() => onReorder(sel.id, "back")}>Send to back</Chip>
            <Chip onClick={() => onDuplicate(sel.id)}>Duplicate</Chip>
            <Chip danger onClick={() => onDelete(sel.id)}>
              Delete
            </Chip>
          </div>
        </div>
      )}

      {stickers.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between">
            <p className="label !mb-1">On your page ({stickers.length})</p>
            <button type="button" className="text-xs text-stone underline" onClick={onClear}>
              Remove all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {stickers.map((s) => {
              const a = getFloral(s.asset);
              return (
                <button
                  key={s.id}
                  type="button"
                  title={a?.name}
                  onClick={() => onSelect(s.id)}
                  className={`h-12 w-12 rounded-lg border bg-[#f6efe4] p-1 ${s.id === selected ? "border-[#2f6fed] ring-2 ring-[#2f6fed]" : "border-line"}`}
                >
                  {a && <ArtThumb art={a} className="h-full w-full object-contain" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <input className="field" placeholder="Search: peony, gold ring, eucalyptus…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((k) => (
            <Chip key={k.id} on={kind === k.id} onClick={() => setKind(k.id)}>
              {k.label}
            </Chip>
          ))}
          {sections.map((x) => (
            <Chip key={x.id} on={kind === `sec:${x.id}`} onClick={() => setKind(`sec:${x.id}`)}>
              {x.name}
              {!premium && cat.payLive && x.locked ? " · Premium" : ""}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FAMILIES.map((f) => (
            <button
              key={f.id}
              type="button"
              title={f.label}
              onClick={() => setFam(fam === f.id ? null : f.id)}
              className={`h-7 w-7 rounded-full border-2 ${fam === f.id ? "border-ink" : "border-white shadow-[0_0_0_1px_#ddd]"}`}
              style={{ background: f.swatch }}
            />
          ))}
          {fam && (
            <button type="button" className="text-xs text-stone underline" onClick={() => setFam(null)}>
              Any colour
            </button>
          )}
        </div>
        {dark && <p className="text-xs text-stone">Some soft watercolours only work on light backgrounds; they&apos;re greyed out on your dark theme.</p>}
        <div className="grid grid-cols-3 gap-2">
          {items.map((f) => {
            const disabled = dark && f.tone === "light";
            const locked = !premium && artLocked(cat, f);
            return (
              <button
                key={f.id}
                type="button"
                disabled={disabled}
                title={disabled ? `${f.name} (light backgrounds only)` : `Add ${f.name}`}
                onClick={() => {
                  if (locked) return setLockMsg(`“${f.name}” is Premium. Upgrade this site under Settings → Premium to use it.`);
                  setLockMsg("");
                  onAdd(f.id);
                }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-[#f6efe4] p-1.5 transition hover:border-stone disabled:opacity-30"
              >
                {locked && <span className="absolute right-1 top-1 z-10 rounded-full bg-ink px-1.5 py-0.5 text-[0.5rem] uppercase tracking-wider text-white">Premium</span>}
                <ArtThumb art={f} className="h-full w-full object-contain transition group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 truncate bg-white/85 px-1 py-0.5 text-[0.6rem] opacity-0 transition group-hover:opacity-100">{f.name}</span>
              </button>
            );
          })}
        </div>
        {lockMsg && <p className="text-sm text-red-700">{lockMsg}</p>}
        {items.length === 0 && <p className="text-sm text-stone">Nothing matches. Try another colour or word.</p>}
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix: string;
}) {
  return (
    <label className="block">
      <span className="label flex justify-between">
        {label}
        <span className="font-normal normal-case tracking-normal text-stone">
          {Math.round(value)}
          {suffix}
        </span>
      </span>
      <input type="range" className="w-full accent-[#2f6fed]" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function Chip({ on, danger, onClick, children }: { on?: boolean; danger?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs ${on ? "border-ink bg-ink text-white" : danger ? "border-red-200 bg-white text-red-700 hover:bg-red-50" : "border-line bg-white hover:border-stone"}`}
    >
      {children}
    </button>
  );
}
