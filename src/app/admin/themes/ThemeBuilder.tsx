"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { InviteSite } from "@/components/invite/InviteSite";
import { floralThumb } from "@/lib/assets";
import { applyCatalog, type Catalog } from "@/lib/catalog-shared";
import { sampleContent, SAMPLE_WISHES } from "@/lib/content";
import { toTheme, type ThemeInput } from "@/lib/custom-theme";
import { luminance } from "@/lib/decor";
import { AMBIENTS, REVEALS } from "@/lib/stickers";

type Opt = { id: string; name: string };
type Art = { id: string; name: string; kind: string; custom: boolean };

const PALETTE: [keyof ThemeInput["palette"], string, string][] = [
  ["bg", "Background", "The page colour"],
  ["surface", "Panels", "Cards and alternating sections"],
  ["text", "Text", "Names and body text"],
  ["muted", "Soft text", "Captions and labels"],
  ["accent", "Accent", "Buttons, dates, highlights"],
  ["onAccent", "Text on accent", "Button text"],
];

const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
};

export function ThemeBuilder({
  initial,
  id,
  status,
  sites = 0,
  catalog,
  art,
  fonts,
  designs,
  collections,
}: {
  initial: ThemeInput;
  id?: string;
  status?: "draft" | "published";
  sites?: number;
  catalog: Catalog;
  art: Art[];
  fonts: string[];
  designs: Opt[];
  collections: Opt[];
}) {
  applyCatalog(catalog);
  const router = useRouter();
  const [t, setT] = useState<ThemeInput>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [artQ, setArtQ] = useState("");
  const [artKind, setArtKind] = useState("wreath");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const content = useMemo(() => sampleContent(), []);
  const preview = useMemo(() => toTheme(id ?? "u-preview", t), [t, id]);
  const set = <K extends keyof ThemeInput>(k: K, v: ThemeInput[K]) => setT((x) => ({ ...x, [k]: v }));
  const setColor = (k: keyof ThemeInput["palette"], v: string) => setT((x) => ({ ...x, palette: { ...x.palette, [k]: v.toUpperCase() } }));

  function autoColours() {
    const { bg, text, accent } = t.palette;
    setT((x) => ({
      ...x,
      palette: { ...x.palette, surface: mix(bg, text, 0.05), muted: mix(text, bg, 0.45), onAccent: luminance(accent) > 0.45 ? "#1B1B1B" : "#FFFFFF" },
    }));
  }

  async function save(publish?: boolean) {
    setBusy(true);
    setMsg(null);
    const res = id
      ? await fetch(`/api/admin/themes/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: t, ...(publish === undefined ? {} : { status: publish ? "published" : "draft" }) }),
        }).catch(() => null)
      : await fetch("/api/admin/themes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ theme: t, publish: !!publish }) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    if (!res?.ok) return setMsg({ ok: false, text: data?.error ?? "Couldn't save." });
    if (!id && data?.id) {
      router.push(`/admin/themes/${data.id}`);
      return;
    }
    setMsg({ ok: true, text: publish === undefined ? "Saved." : publish ? "Saved and published: it's in the gallery now." : "Saved as a draft (only you can see it)." });
    router.refresh();
  }

  const artList = art.filter((a) => (artKind === "all" || a.kind === artKind || (artKind === "mine" && a.custom)) && (!artQ || a.name.toLowerCase().includes(artQ.toLowerCase()))).slice(0, 80);
  const font = (k: "display" | "body" | "script", label: string, optional = false) => (
    <label className="block">
      <span className="label">{label}</span>
      <select
        className="field"
        value={t.fonts[k] ?? ""}
        onChange={(e) => setT((x) => ({ ...x, fonts: { ...x.fonts, [k]: e.target.value || undefined } as ThemeInput["fonts"] }))}
      >
        {optional && <option value="">None (use the headings font)</option>}
        {fonts.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <div className="space-y-5 pb-28">
        {id && (
          <p className="text-sm text-stone">
            {status === "published" ? "Published: in the gallery." : "Draft: only you can see it."} {sites > 0 && `${sites} site${sites > 1 ? "s use" : " uses"} it.`}{" "}
            <Link href={`/themes/${id}`} target="_blank" className="underline">
              Open full preview
            </Link>
          </p>
        )}
        <Card title="Basics">
          <label className="block">
            <span className="label">Name</span>
            <input className="field" maxLength={60} value={t.name} placeholder="e.g. Midnight Jasmine" onChange={(e) => set("name", e.target.value)} />
          </label>
          <label className="block">
            <span className="label">Description</span>
            <textarea className="field" rows={2} maxLength={240} value={t.description} onChange={(e) => set("description", e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label">Collection</span>
              <select className="field" value={t.collection} onChange={(e) => set("collection", e.target.value)}>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Site design</span>
              <select className="field" value={t.template} onChange={(e) => set("template", e.target.value)}>
                {designs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="label">Search tags (comma-separated)</span>
            <input
              className="field"
              value={t.tags.join(", ")}
              placeholder="navy, gold, winter"
              onChange={(e) =>
                set(
                  "tags",
                  e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean)
                    .slice(0, 8),
                )
              }
            />
          </label>
        </Card>

        <Card title="Main art">
          <div className="flex gap-2">
            <select className="field !w-36 !py-1.5 text-sm" value={artKind} onChange={(e) => setArtKind(e.target.value)}>
              {["wreath", "frame", "bouquet", "corner", "garland", "border", "elements", "mine", "all"].map((k) => (
                <option key={k} value={k}>
                  {k === "mine" ? "Uploaded by me" : k === "all" ? "Everything" : k}
                </option>
              ))}
            </select>
            <input className="field !py-1.5 text-sm" placeholder="Search art" value={artQ} onChange={(e) => setArtQ(e.target.value)} />
          </div>
          <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto pr-1">
            {artList.map((a) => (
              <button
                key={a.id}
                type="button"
                title={a.name}
                onClick={() => set("heroArt", a.id)}
                className={`aspect-square rounded-lg border bg-[#f6efe4] p-1 ${t.heroArt === a.id ? "border-ink ring-2 ring-ink" : "border-line"}`}
              >
                <img src={floralThumb(a.id)} alt={a.name} loading="lazy" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
          <label className="block">
            <span className="label">Print finish</span>
            <select className="field" value={t.finish} onChange={(e) => set("finish", e.target.value as ThemeInput["finish"])}>
              <option value="painted">Painted (original colours)</option>
              <option value="white">White ink (for dark backgrounds)</option>
              <option value="gold">Gold foil</option>
              <option value="ink">Black ink</option>
            </select>
          </label>
        </Card>

        <Card title="Colours">
          {PALETTE.map(([k, label, hint]) => (
            <label key={k} className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm">{label}</span>
                <span className="block text-xs text-stone">{hint}</span>
              </span>
              <span className="flex items-center gap-2">
                <input className="field !w-24 !py-1 font-mono text-xs" value={t.palette[k]} maxLength={7} onChange={(e) => setColor(k, e.target.value)} />
                <input type="color" value={t.palette[k]} onChange={(e) => setColor(k, e.target.value)} className="h-9 w-11 cursor-pointer rounded border border-line bg-white p-0.5" />
              </span>
            </label>
          ))}
          <button type="button" className="text-xs underline" onClick={autoColours}>
            Work out panels, soft text and button text from the others
          </button>
        </Card>

        <Card title="Fonts">
          {font("display", "Headings & names")}
          {font("body", "Body text")}
          {font("script", "Script accents", true)}
        </Card>

        <Card title="Motion">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label">Sections appear</span>
              <select className="field" value={t.reveal} onChange={(e) => set("reveal", e.target.value as ThemeInput["reveal"])}>
                {(Object.keys(REVEALS) as (keyof typeof REVEALS)[]).map((k) => (
                  <option key={k} value={k}>
                    {REVEALS[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Falling art</span>
              <select className="field" value={t.ambient} onChange={(e) => set("ambient", e.target.value as ThemeInput["ambient"])}>
                {(Object.keys(AMBIENTS) as (keyof typeof AMBIENTS)[]).map((k) => (
                  <option key={k} value={k}>
                    {AMBIENTS[k]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {t.ambient !== "none" && (
            <label className="block">
              <span className="label">Amount</span>
              <select className="field" value={t.amount} onChange={(e) => set("amount", e.target.value as ThemeInput["amount"])}>
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
              </select>
            </label>
          )}
        </Card>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-5 py-3 backdrop-blur lg:left-60">
          <div className="flex flex-wrap items-center gap-3">
            {id ? (
              <>
                <button type="button" className="btn" disabled={busy} onClick={() => save()}>
                  Save
                </button>
                <button type="button" className="btn btn-light" disabled={busy} onClick={() => save(status !== "published")}>
                  {status === "published" ? "Save & unpublish" : "Save & publish"}
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn" disabled={busy || t.name.trim().length < 2} onClick={() => save(true)}>
                  Create &amp; publish
                </button>
                <button type="button" className="btn btn-light" disabled={busy || t.name.trim().length < 2} onClick={() => save(false)}>
                  Save as draft
                </button>
              </>
            )}
            <Link href="/admin/catalog" className="text-sm text-stone underline">
              Back to themes
            </Link>
            {msg && <span className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>{msg.text}</span>}
          </div>
        </div>
      </div>

      <div className="xl:sticky xl:top-4 xl:self-start">
        <div className="mb-2 flex items-center gap-2 text-xs">
          <span className="text-stone">Live preview</span>
          {(["desktop", "mobile"] as const).map((d) => (
            <button key={d} type="button" onClick={() => setDevice(d)} className={`rounded-full border px-3 py-1 ${device === d ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
              {d === "desktop" ? "Computer" : "Phone"}
            </button>
          ))}
        </div>
        <div className={`mx-auto h-[78vh] overflow-y-auto overflow-x-hidden bg-white shadow-xl ${device === "mobile" ? "w-[390px] rounded-[2rem] border-[10px] border-ink" : "w-full rounded-xl"}`}>
          <InviteSite themeId={preview.id} theme={preview} content={content} wishes={SAMPLE_WISHES} mode="preview" />
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl bg-white p-5">
      <h2 className="font-serif text-2xl">{title}</h2>
      {children}
    </section>
  );
}
