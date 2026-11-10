/* eslint-disable @next/next/no-img-element */
"use client";

import { useCatalog } from "@/components/CatalogProvider";
import { visibleThemes } from "@/lib/catalog-shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { InviteSite } from "@/components/invite/InviteSite";
import { SAMPLE_WISHES, SECTION_LABELS, musicEmbed, type Customization, type InviteContent, type SectionId } from "@/lib/content";
import { COLLECTIONS, FONT_CHOICES, getTheme, img, TEMPLATES, templateOf, type CollectionId } from "@/lib/themes";
import type { Wish } from "@/components/invite/ctx";
import { ShareTools } from "./ShareTools";
import { DecorPanel } from "./DecorPanel";
import { EffectsPanel } from "./EffectsPanel";
import { AiButton, AiSite, FaqAi, ThemeMatch, TranslatePanel } from "./AiAssist";
import { LibraryPanel } from "./LibraryPanel";
import { anchorAt, measure } from "@/components/invite/StickerLayer";
import { getFloral } from "@/lib/assets";
import { luminance, resolveDecorStyle } from "@/lib/decor";
import { newStickerId, type Sticker } from "@/lib/stickers";

type Photo = { id: string; url: string };
type Tab = "design" | "decor" | "library" | "effects" | "content" | "sections" | "photos" | "settings";
type SaveState = "saved" | "saving" | "unsaved" | "error";

export function Editor({
  site,
  initialContent,
  initialCustomization,
  initialPhotos,
  initialWishes,
  pay,
}: {
  site: { id: string; slug: string; themeId: string; published: boolean; isProtected: boolean; premium: boolean };
  pay: { live: boolean; amount: number; currency: string; features: string[]; justPaid: boolean; cancelled: boolean };
  initialContent: InviteContent;
  initialCustomization: Customization;
  initialPhotos: Photo[];
  initialWishes: Wish[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(pay.justPaid || pay.cancelled ? "settings" : "design");
  const [themeId, setThemeId] = useState(site.themeId);
  const [content, setContent] = useState(initialContent);
  const [cz, setCz] = useState(initialCustomization);
  const [photos, setPhotos] = useState(initialPhotos);
  const [slug, setSlug] = useState(site.slug);
  const [published, setPublished] = useState(site.published);
  const [isProtected, setIsProtected] = useState(site.isProtected);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [save, setSave] = useState<SaveState>("saved");
  const [notice, setNotice] = useState("");
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const previewRef = useRef<HTMLElement>(null);

  // ── Autosave (debounced) ───────────────────────────────────
  const dirty = useRef(false);
  const first = useRef(true);
  const persist = useCallback(
    async (body: object) => {
      setSave("saving");
      const res = await fetch(`/api/sites/${site.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => null);
      const data = await res?.json().catch(() => null);
      if (!res?.ok) {
        setSave("error");
        setNotice(data?.error ?? "Couldn't save. Check your connection.");
        return null;
      }
      setSave("saved");
      return data;
    },
    [site.id],
  );

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    dirty.current = true;
    setSave("unsaved");
    const t = setTimeout(async () => {
      dirty.current = false;
      await persist({ themeId, content, customization: cz });
    }, 700);
    return () => clearTimeout(t);
  }, [themeId, content, cz, persist]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const patch = <K extends keyof InviteContent>(key: K, value: InviteContent[K]) => setContent((c) => ({ ...c, [key]: value }));

  // ── Placed library art ─────────────────────────────────────
  const theme = getTheme(themeId);
  const stickers = cz.stickers ?? theme.stickers ?? [];
  const dark = luminance(cz.bg || theme.palette.bg) < 0.12;
  const setStickers = (fn: (list: Sticker[]) => Sticker[]) => setCz((c) => ({ ...c, stickers: fn(c.stickers ?? getTheme(themeId).stickers ?? []) }));
  const stickerOps = {
    onChange: (s: Sticker) => setStickers((l) => l.map((x) => (x.id === s.id ? s : x))),
    onDelete: (id: string) => {
      setStickers((l) => l.filter((x) => x.id !== id));
      setSelectedSticker(null);
    },
    onDuplicate: (id: string) => {
      const copy = { ...stickers.find((x) => x.id === id)!, id: newStickerId() };
      copy.x += 4;
      copy.y += 4;
      setStickers((l) => [...l, copy]);
      setSelectedSticker(copy.id);
    },
  };
  function addSticker(asset: string) {
    const fl = getFloral(asset);
    if (!fl) return;
    const w = fl.kind === "frame" || fl.kind === "wreath" ? 44 : fl.kind === "border" || fl.kind === "garland" ? 56 : fl.kind === "corner" ? 30 : 22;
    // Drop it in the middle of whatever part of the page is on screen.
    let anchor = "top";
    let y = 50;
    const inv = previewRef.current?.querySelector<HTMLElement>(".inv");
    const pane = previewRef.current;
    if (inv && pane) {
      const pr = pane.getBoundingClientRect();
      const mid = pr.top + Math.min(pr.height, window.innerHeight - pr.top) / 2 - inv.getBoundingClientRect().top;
      const [id, box] = anchorAt(measure(inv), mid);
      anchor = id;
      y = ((mid - box.top) / box.height) * 100;
    }
    const s: Sticker = { id: newStickerId(), asset, anchor, x: 50, y, w, r: 0, anim: "fade" };
    setStickers((l) => [...l, s]);
    setSelectedSticker(s.id);
    if (showPreviewMobile === false && window.innerWidth < 1024) setNotice("Added. Open the preview to move it.");
  }

  async function togglePublish() {
    const data = await persist({ published: !published, themeId, content, customization: cz });
    if (data) {
      setPublished(data.published);
      setNotice(data.published ? "Your site is live! 🎉" : "Site unpublished.");
      router.refresh();
    }
  }

  return (
    <AiSite.Provider value={site.id}>
    <div className="flex h-svh flex-col bg-cream">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-white px-4">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/dashboard" className="text-sm text-stone hover:text-ink">
            ← Sites
          </Link>
          <span className="hidden truncate font-serif text-xl sm:block">
            {content.partner1} &amp; {content.partner2}
          </span>
          <SaveBadge state={save} />
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden rounded-full border border-line p-0.5 lg:flex">
            {(["desktop", "mobile"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`rounded-full px-3 py-1 text-xs capitalize ${device === d ? "bg-ink text-white" : "text-stone"}`}
              >
                {d}
              </button>
            ))}
          </div>
          <button className="btn btn-light !px-4 !py-2 lg:hidden" onClick={() => setShowPreviewMobile((v) => !v)}>
            {showPreviewMobile ? "Edit" : "Preview"}
          </button>
          <Link href={`/dashboard/sites/${site.id}/card`} className="btn btn-light hidden !px-4 !py-2 md:inline-flex">
            Invitation card
          </Link>
          <a href={`/${slug}`} target="_blank" className="btn btn-light hidden !px-4 !py-2 sm:inline-flex">
            View
          </a>
          <button onClick={togglePublish} className={`btn !px-4 !py-2 ${published ? "!bg-emerald-700" : ""}`}>
            {published ? "Live ✓" : "Publish"}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Side panel */}
        <aside className={`${showPreviewMobile ? "hidden" : "flex"} w-full shrink-0 flex-col border-r border-line bg-white lg:flex lg:w-[420px]`}>
          <nav className="flex shrink-0 overflow-x-auto border-b border-line text-sm [scrollbar-width:none]">
            {(["design", "decor", "library", "effects", "content", "sections", "photos", "settings"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-none border-b-2 px-3 py-3 capitalize ${tab === t ? "border-ink font-medium text-ink" : "border-transparent text-stone"}`}
              >
                {t}
              </button>
            ))}
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {tab === "design" && <DesignPanel themeId={themeId} setThemeId={setThemeId} cz={cz} setCz={setCz} photos={photos} />}
            {tab === "decor" && <DecorPanel themeId={themeId} cz={cz} setCz={setCz} />}
            {tab === "library" && (
              <LibraryPanel
                stickers={stickers}
                selected={selectedSticker}
                dark={dark}
                onAdd={addSticker}
                onSelect={setSelectedSticker}
                onReorder={(id, to) =>
                  setStickers((l) => {
                    const s = l.find((x) => x.id === id)!;
                    const rest = l.filter((x) => x.id !== id);
                    return to === "front" ? [...rest, s] : [s, ...rest];
                  })
                }
                onClear={() => {
                  setStickers(() => []);
                  setSelectedSticker(null);
                }}
                {...stickerOps}
              />
            )}
            {tab === "effects" && (
              <EffectsPanel
                cz={cz}
                setCz={setCz}
                themeEffects={theme.effects ?? {}}
                ink={!!resolveDecorStyle(theme, (cz.template as never) || templateOf(theme), { decor: cz.decor, style: cz.style }).decor.ink}
                intro={content.intro}
                setIntro={(v) => patch("intro", v)}
              />
            )}
            {tab === "content" && <ContentPanel c={content} patch={patch} photos={photos} />}
            {tab === "sections" && <SectionsPanel c={content} setContent={setContent} />}
            {tab === "photos" && (
              <PhotosPanel siteId={site.id} photos={photos} setPhotos={setPhotos} cz={cz} setCz={setCz} onNotice={setNotice} />
            )}
            {tab === "settings" && (
              <SettingsPanel
                premium={site.premium}
                pay={pay}
                translation={cz.translation}
                onTranslation={(t) => setCz((x) => ({ ...x, translation: t }))}
                siteId={site.id}
                slug={slug}
                published={published}
                isProtected={isProtected}
                names={`${content.partner1} & ${content.partner2}`}
                onSlug={async (s) => {
                  const d = await persist({ slug: s });
                  if (d) {
                    setSlug(d.slug);
                    setNotice("Link updated.");
                  }
                }}
                onPassword={async (pw) => {
                  const d = await persist({ password: pw });
                  if (d) {
                    setIsProtected(d.protected);
                    setNotice(d.protected ? "Password set. Guests will need it to view your site." : "Password removed.");
                  }
                  return !!d;
                }}
              />
            )}
          </div>
        </aside>

        {/* Preview */}
        <section
          ref={previewRef}
          onPointerDown={(e) => {
            if (selectedSticker && !(e.target as HTMLElement).closest(".stk")) setSelectedSticker(null);
          }}
          className={`${showPreviewMobile ? "block" : "hidden"} min-w-0 flex-1 overflow-y-auto lg:block`}
        >
          <div className={`mx-auto my-6 overflow-clip bg-white shadow-xl transition-all ${device === "mobile" ? "w-[390px] rounded-[2rem] border-[10px] border-ink" : "w-[calc(100%-3rem)] max-w-[1280px] rounded-xl"}`}>
            <InviteSite
              themeId={themeId}
              content={content}
              customization={cz}
              photos={photos.map((p) => p.url)}
              wishes={initialWishes.length ? initialWishes : SAMPLE_WISHES}
              mode="preview"
              stickerEditing={{
                selected: selectedSticker,
                onSelect: (id) => {
                  setSelectedSticker(id);
                  if (id) setTab("library");
                },
                ...stickerOps,
              }}
            />
          </div>
        </section>
      </div>

      {notice && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm text-white shadow-lg">{notice}</div>
      )}
    </div>
    </AiSite.Provider>
  );
}

function SaveBadge({ state }: { state: SaveState }) {
  const map = {
    saved: ["Saved", "text-emerald-700"],
    saving: ["Saving…", "text-stone"],
    unsaved: ["Unsaved changes", "text-stone"],
    error: ["Not saved", "text-red-600"],
  } as const;
  return <span className={`shrink-0 text-xs ${map[state][1]}`}>{map[state][0]}</span>;
}

/* ─── Shared bits ──────────────────────────────────────────── */

function Group({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-8">
      <h3 className="font-serif text-xl">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-stone">{hint}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Text({
  label,
  value,
  onChange,
  multiline,
  placeholder,
  type = "text",
  max,
  ai,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  type?: string;
  max?: number;
  /** Adds "Write with AI" for this field. */
  ai?: string;
}) {
  const input = (
    <label className="block">
      <span className="label">{label}</span>
      {multiline ? (
        <textarea className="field min-h-28" value={value} placeholder={placeholder} maxLength={max} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="field" type={type} value={value} placeholder={placeholder} maxLength={max} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
  if (!ai) return input;
  return (
    <div>
      {input}
      <div className="mt-1.5">
        <AiButton field={ai} value={value} onApply={onChange} />
      </div>
    </div>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-xs text-stone underline hover:text-red-600">
      Remove
    </button>
  );
}

/* ─── Design ───────────────────────────────────────────────── */

function DesignPanel({
  themeId,
  setThemeId,
  cz,
  setCz,
  photos,
}: {
  themeId: string;
  setThemeId: (id: string) => void;
  cz: Customization;
  setCz: React.Dispatch<React.SetStateAction<Customization>>;
  photos: Photo[];
}) {
  const cat = useCatalog();
  const [filter, setFilter] = useState<CollectionId | "all">("all");
  const theme = getTheme(themeId);
  const color = (key: "accent" | "bg" | "text", label: string, fallback: string) => (
    <label className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-2">
        {cz[key] && (
          <button className="text-xs text-stone underline" onClick={() => setCz((c) => ({ ...c, [key]: undefined }))}>
            Reset
          </button>
        )}
        <input
          type="color"
          value={cz[key] || fallback}
          onChange={(e) => setCz((c) => ({ ...c, [key]: e.target.value }))}
          className="h-9 w-12 cursor-pointer rounded border border-line bg-white p-0.5"
        />
      </span>
    </label>
  );
  const font = (key: "displayFont" | "bodyFont" | "scriptFont", label: string, list: string[], fallback?: string) => (
    <label className="block">
      <span className="label">{label}</span>
      <select className="field" value={cz[key] || ""} onChange={(e) => setCz((c) => ({ ...c, [key]: e.target.value || undefined }))}>
        <option value="">Theme default ({fallback ?? "none"})</option>
        {list.map((f) => (
          <option key={f} value={f} style={{ fontFamily: `"${f}"` }}>
            {f}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <>
      <div className="mb-8">
        <ThemeMatch onPick={setThemeId} />
      </div>
      <Group
        title="Theme"
        hint={`Current design: ${TEMPLATES.find((x) => x.id === templateOf(theme))?.name}. ${TEMPLATES.find((x) => x.id === templateOf(theme))?.blurb} Switch any time; your words and photos stay put.`}
      >
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[{ id: "all" as const, name: "All" }, ...COLLECTIONS].map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs ${filter === c.id ? "border-ink bg-ink text-white" : "border-line"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {visibleThemes(cat).filter((t) => filter === "all" || t.collection === filter).map((t) => (
            <button
              key={t.id}
              onClick={() => setThemeId(t.id)}
              title={t.name}
              className={`overflow-hidden rounded-lg border text-left transition ${t.id === themeId ? "border-ink ring-2 ring-ink" : "border-line hover:border-stone"}`}
            >
              <div className="aspect-[4/5]" style={{ background: t.palette.bg }}>
                <img
                  src={img(t.hero, 240)}
                  alt=""
                  loading="lazy"
                  className={`h-full w-full ${t.layout === "botanical" ? "object-contain p-2 mix-blend-multiply" : t.layout === "poster" ? "object-contain p-2" : "object-cover"}`}
                  style={t.heroFilter ? { filter: t.heroFilter } : undefined}
                />
              </div>
              <div className="px-1.5 py-1">
                <div className="truncate text-[0.7rem]">{t.name}</div>
                <div className="truncate text-[0.6rem] text-stone">{TEMPLATES.find((x) => x.id === templateOf(t))?.name}</div>
              </div>
            </button>
          ))}
        </div>
      </Group>

      <Group title="Colours" hint={`Starting from ${theme.name}.`}>
        {color("accent", "Accent", theme.palette.accent)}
        {color("bg", "Background", theme.palette.bg)}
        {color("text", "Text", theme.palette.text)}
      </Group>

      <Group title="Fonts">
        {font("displayFont", "Headings & names", FONT_CHOICES.display, theme.fonts.display)}
        {font("bodyFont", "Body text", FONT_CHOICES.body, theme.fonts.body)}
        {font("scriptFont", "Script accents", FONT_CHOICES.script, theme.fonts.script)}
      </Group>

      <Group title="Cover photo" hint="Use one of your own photos instead of the theme image.">
        {photos.length === 0 ? (
          <p className="text-sm text-stone">Upload photos in the Photos tab first.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setCz((c) => ({ ...c, coverUrl: undefined }))}
              className={`flex aspect-square items-center justify-center rounded-lg border text-center text-[0.65rem] ${!cz.coverUrl ? "border-ink ring-2 ring-ink" : "border-line"}`}
            >
              Theme image
            </button>
            {photos.map((p) => (
              <button
                key={p.id}
                onClick={() => setCz((c) => ({ ...c, coverUrl: p.url }))}
                className={`overflow-hidden rounded-lg border ${cz.coverUrl === p.url ? "border-ink ring-2 ring-ink" : "border-line"}`}
              >
                <img src={p.url} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </Group>
    </>
  );
}

/* ─── Content ──────────────────────────────────────────────── */

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3">
      <input type="checkbox" className="mt-1" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block text-sm">{label}</span>
        {hint && <span className="block text-xs text-stone">{hint}</span>}
      </span>
    </label>
  );
}

function ContentPanel({
  c,
  patch,
  photos,
}: {
  c: InviteContent;
  patch: <K extends keyof InviteContent>(k: K, v: InviteContent[K]) => void;
  photos: Photo[];
}) {
  const ev = (which: "ceremony" | "reception", label: string) => {
    const e = c.details[which];
    const set = (k: keyof typeof e, v: string) => patch("details", { ...c.details, [which]: { ...e, [k]: v } });
    return (
      <div className="rounded-xl border border-line p-3">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-stone">{label}</div>
        <div className="space-y-2">
          <Text label="Title" value={e.title} onChange={(v) => set("title", v)} max={80} />
          <Text label="Time" value={e.time} onChange={(v) => set("time", v)} placeholder="4:00 PM" max={40} />
          <Text label="Venue" value={e.venue} onChange={(v) => set("venue", v)} max={120} />
          <Text label="Address" value={e.address} onChange={(v) => set("address", v)} max={200} />
          <Text label="Map link (optional)" value={e.mapUrl} onChange={(v) => set("mapUrl", v)} placeholder="https://maps.google.com/…" max={500} />
        </div>
      </div>
    );
  };

  return (
    <>
      <Group title="The basics">
        <div className="grid grid-cols-2 gap-3">
          <Text label="Partner one" value={c.partner1} onChange={(v) => patch("partner1", v)} max={60} />
          <Text label="Partner two" value={c.partner2} onChange={(v) => patch("partner2", v)} max={60} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Text label="Date" type="date" value={c.date} onChange={(v) => patch("date", v)} />
          <Text label="Location" value={c.location} onChange={(v) => patch("location", v)} max={120} />
        </div>
        <Text ai="headline" label="Headline" value={c.headline} onChange={(v) => patch("headline", v)} placeholder="Together with their families" max={120} />
        <Text ai="tagline" label="Tagline" value={c.tagline} onChange={(v) => patch("tagline", v)} placeholder="invite you to celebrate their wedding" max={200} />
        <Toggle
          checked={c.intro}
          onChange={(v) => patch("intro", v)}
          label="“Open your invitation” intro screen"
          hint="Guests see a sealed invitation card first and tap to open it."
        />
      </Group>

      <Group title="Our story">
        <Text ai="story" label="Your story" multiline value={c.story.body} onChange={(v) => patch("story", { body: v })} max={4000} />
      </Group>

      <Group title="Ceremony & reception">
        {ev("ceremony", "Ceremony")}
        {ev("reception", "Reception")}
        <Toggle
          checked={c.details.showMap}
          onChange={(v) => patch("details", { ...c.details, showMap: v })}
          label="Show a map of the venue"
          hint="Embeds a Google map of the first address."
        />
      </Group>

      <Group title="Wedding party" hint="Bridesmaids, groomsmen, officiant, flower girl…">
        {c.party.members.map((m, i) => {
          const set = (k: "name" | "role" | "photo", v: string) =>
            patch("party", { members: c.party.members.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });
          return (
            <div key={i} className="rounded-xl border border-line p-3">
              <div className="grid grid-cols-2 gap-2">
                <Text label="Name" value={m.name} onChange={(v) => set("name", v)} max={80} />
                <Text label="Role" value={m.role} onChange={(v) => set("role", v)} max={80} />
              </div>
              {photos.length > 0 && (
                <div className="mt-2">
                  <span className="label">Photo</span>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    <button
                      type="button"
                      onClick={() => set("photo", "")}
                      className={`h-11 w-11 shrink-0 rounded-full border text-[0.6rem] ${!m.photo ? "border-ink ring-2 ring-ink" : "border-line"}`}
                    >
                      None
                    </button>
                    {photos.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => set("photo", p.url)}
                        className={`h-11 w-11 shrink-0 overflow-hidden rounded-full border ${m.photo === p.url ? "border-ink ring-2 ring-ink" : "border-line"}`}
                      >
                        <img src={p.url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-2 text-right">
                <RemoveBtn onClick={() => patch("party", { members: c.party.members.filter((_, j) => j !== i) })} />
              </div>
            </div>
          );
        })}
        {c.party.members.length < 24 && (
          <button
            className="btn btn-light w-full"
            onClick={() => patch("party", { members: [...c.party.members, { name: "", role: "", photo: "" }] })}
          >
            + Add person
          </button>
        )}
      </Group>

      <Group title="Our song" hint="Paste a Spotify or YouTube link. Guests can play it right on your site.">
        <Text
          label="Spotify or YouTube link"
          value={c.music.url}
          onChange={(v) => patch("music", { ...c.music, url: v })}
          placeholder="https://open.spotify.com/track/…"
          max={300}
        />
        {c.music.url && !musicEmbed(c.music.url) && <p className="text-xs text-red-700">That link isn&rsquo;t a Spotify or YouTube song link.</p>}
        <Text ai="musicNote" label="A note about it" value={c.music.note} onChange={(v) => patch("music", { ...c.music, note: v })} max={300} />
      </Group>

      <Group title="Guestbook" hint="Guests can leave you notes on your site. You can hide any of them from the Guests page.">
        <Text ai="wishes" label="Invitation to write" multiline value={c.wishes.body} onChange={(v) => patch("wishes", { body: v })} max={300} />
      </Group>

      <Group title="Guest helper" hint="An “Ask us anything” button on your site. It answers guests' questions using only what you've written here, and says so when it doesn't know.">
        <Toggle checked={c.ask.enabled} onChange={(v) => patch("ask", { enabled: v })} label="Let guests ask questions" hint="Fill in your details, travel and FAQ so it has good answers." />
      </Group>

      <Group title="Schedule">
        {c.schedule.items.map((it, i) => {
          const set = (k: keyof typeof it, v: string) =>
            patch("schedule", { items: c.schedule.items.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });
          return (
            <div key={i} className="rounded-xl border border-line p-3">
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <Text label="Time" value={it.time} onChange={(v) => set("time", v)} max={40} />
                <Text label="Event" value={it.title} onChange={(v) => set("title", v)} max={80} />
              </div>
              <div className="mt-2">
                <Text label="Detail" value={it.detail} onChange={(v) => set("detail", v)} max={200} />
              </div>
              <div className="mt-2 text-right">
                <RemoveBtn onClick={() => patch("schedule", { items: c.schedule.items.filter((_, j) => j !== i) })} />
              </div>
            </div>
          );
        })}
        {c.schedule.items.length < 20 && (
          <button className="btn btn-light w-full" onClick={() => patch("schedule", { items: [...c.schedule.items, { time: "", title: "", detail: "" }] })}>
            + Add event
          </button>
        )}
      </Group>

      <Group title="Travel & stay">
        <Text ai="travel" label="Details" multiline value={c.travel.body} onChange={(v) => patch("travel", { body: v })} max={3000} />
      </Group>

      <Group title="Dress code">
        <Text ai="dressCode" label="Details" multiline value={c.dressCode.body} onChange={(v) => patch("dressCode", { body: v })} max={1000} />
      </Group>

      <Group title="Registry">
        <Text ai="registry" label="Message" multiline value={c.registry.body} onChange={(v) => patch("registry", { ...c.registry, body: v })} max={1000} />
        {c.registry.links.map((l, i) => {
          const set = (k: "label" | "url", v: string) =>
            patch("registry", { ...c.registry, links: c.registry.links.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });
          return (
            <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] items-end gap-2">
              <Text label="Button" value={l.label} onChange={(v) => set("label", v)} max={60} />
              <Text label="Link" value={l.url} onChange={(v) => set("url", v)} placeholder="https://" max={500} />
              <div className="pb-3">
                <RemoveBtn onClick={() => patch("registry", { ...c.registry, links: c.registry.links.filter((_, j) => j !== i) })} />
              </div>
            </div>
          );
        })}
        {c.registry.links.length < 10 && (
          <button className="btn btn-light w-full" onClick={() => patch("registry", { ...c.registry, links: [...c.registry.links, { label: "", url: "" }] })}>
            + Add registry link
          </button>
        )}
      </Group>

      <Group title="FAQ">
        {c.faq.items.map((f, i) => {
          const set = (k: "q" | "a", v: string) => patch("faq", { items: c.faq.items.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });
          return (
            <div key={i} className="rounded-xl border border-line p-3">
              <Text label="Question" value={f.q} onChange={(v) => set("q", v)} max={200} />
              <div className="mt-2">
                <Text label="Answer" multiline value={f.a} onChange={(v) => set("a", v)} max={1000} />
              </div>
              <div className="mt-2 text-right">
                <RemoveBtn onClick={() => patch("faq", { items: c.faq.items.filter((_, j) => j !== i) })} />
              </div>
            </div>
          );
        })}
        <FaqAi onAdd={(items) => patch("faq", { items: [...c.faq.items, ...items].slice(0, 30) })} />
        {c.faq.items.length < 30 && (
          <button className="btn btn-light w-full" onClick={() => patch("faq", { items: [...c.faq.items, { q: "", a: "" }] })}>
            + Add question
          </button>
        )}
      </Group>

      <Group title="RSVP">
        <Text label="Reply by" type="date" value={c.rsvp.deadline} onChange={(v) => patch("rsvp", { ...c.rsvp, deadline: v })} />
        <Text ai="rsvp" label="Message" multiline value={c.rsvp.body} onChange={(v) => patch("rsvp", { ...c.rsvp, body: v })} max={500} />
        <label className="block">
          <span className="label">Max guests per reply</span>
          <select className="field" value={c.rsvp.maxGuests} onChange={(e) => patch("rsvp", { ...c.rsvp, maxGuests: Number(e.target.value) })}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={c.rsvp.askMeal} onChange={(e) => patch("rsvp", { ...c.rsvp, askMeal: e.target.checked })} />
          Ask for meal preference
        </label>
        {c.rsvp.askMeal && (
          <MealOptions value={c.rsvp.mealOptions} onChange={(mealOptions) => patch("rsvp", { ...c.rsvp, mealOptions })} />
        )}
      </Group>
    </>
  );
}

function MealOptions({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  // Keep raw text locally so typing commas/spaces isn't fighting the parser.
  const [raw, setRaw] = useState(value.join(", "));
  return (
    <Text
      label="Meal options (comma separated)"
      value={raw}
      onChange={(v) => {
        setRaw(v);
        onChange(
          v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 8),
        );
      }}
      placeholder="Beef, Fish, Vegetarian"
    />
  );
}

/* ─── Sections ─────────────────────────────────────────────── */

function SectionsPanel({ c, setContent }: { c: InviteContent; setContent: React.Dispatch<React.SetStateAction<InviteContent>> }) {
  const move = (i: number, d: -1 | 1) =>
    setContent((c) => {
      const order = [...c.sectionOrder];
      const j = i + d;
      if (j < 0 || j >= order.length) return c;
      [order[i], order[j]] = [order[j], order[i]];
      return { ...c, sectionOrder: order };
    });
  const toggle = (id: SectionId) =>
    setContent((c) => ({ ...c, hidden: c.hidden.includes(id) ? c.hidden.filter((h) => h !== id) : [...c.hidden, id] }));
  const rename = (id: SectionId, v: string) => setContent((c) => ({ ...c, titles: { ...c.titles, [id]: v || undefined } }));

  return (
    <Group title="Sections" hint="Reorder, rename or hide any part of your site.">
      {c.sectionOrder.map((id, i) => {
        const hidden = c.hidden.includes(id);
        return (
          <div key={id} className={`rounded-xl border border-line p-3 ${hidden ? "bg-cream/50 opacity-60" : "bg-white"}`}>
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <button aria-label="Move up" className="px-1 text-stone hover:text-ink disabled:opacity-30" disabled={i === 0} onClick={() => move(i, -1)}>
                  ▲
                </button>
                <button
                  aria-label="Move down"
                  className="px-1 text-stone hover:text-ink disabled:opacity-30"
                  disabled={i === c.sectionOrder.length - 1}
                  onClick={() => move(i, 1)}
                >
                  ▼
                </button>
              </div>
              <input
                className="field !py-1.5"
                value={c.titles[id] ?? ""}
                placeholder={SECTION_LABELS[id]}
                maxLength={80}
                onChange={(e) => rename(id, e.target.value)}
              />
              <label className="flex shrink-0 items-center gap-1.5 text-xs">
                <input type="checkbox" checked={!hidden} onChange={() => toggle(id)} />
                Show
              </label>
            </div>
          </div>
        );
      })}
    </Group>
  );
}

/* ─── Photos ───────────────────────────────────────────────── */

function PhotosPanel({
  siteId,
  photos,
  setPhotos,
  cz,
  setCz,
  onNotice,
}: {
  siteId: string;
  photos: Photo[];
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  cz: Customization;
  setCz: React.Dispatch<React.SetStateAction<Customization>>;
  onNotice: (s: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    let added = 0;
    for (const file of [...files]) {
      const fd = new FormData();
      fd.append("files", await shrinkPhoto(file));
      const res = await fetch(`/api/sites/${siteId}/photos`, { method: "POST", body: fd }).catch(() => null);
      const data = await res?.json().catch(() => null);
      if (!res?.ok) {
        onNotice(data?.error ?? `Upload failed for ${file.name}.`);
        break;
      }
      added += data.photos.length;
      setPhotos((p) => [...p, ...data.photos]);
    }
    setBusy(false);
    if (added) onNotice(`${added} photo${added > 1 ? "s" : ""} added.`);
  }

  async function remove(p: Photo) {
    if (!confirm("Delete this photo? This can't be undone.")) return;
    const res = await fetch(`/api/photos/${p.id}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      setPhotos((ps) => ps.filter((x) => x.id !== p.id));
      if (cz.coverUrl === p.url) setCz((c) => ({ ...c, coverUrl: undefined }));
    } else onNotice("Couldn't delete that photo.");
  }

  return (
    <Group title="Your photos" hint="JPG, PNG or WebP, up to 10 MB each. These fill your gallery, and any one can be your cover.">
      <label
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line p-8 text-center hover:border-stone ${busy ? "opacity-50" : ""}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          upload(e.dataTransfer.files);
        }}
      >
        <span className="font-serif text-xl">{busy ? "Uploading…" : "Drop photos here"}</span>
        <span className="mt-1 text-xs text-stone">or click to choose</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" disabled={busy} onChange={(e) => upload(e.target.files)} />
      </label>
      {photos.length === 0 && <p className="text-xs text-stone">Until you add your own, the preview shows sample photos. They won’t appear on your live site.</p>}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p) => (
          <div key={p.id} className="group relative overflow-hidden rounded-lg border border-line">
            <img src={p.url} alt="" className="aspect-square w-full object-cover" />
            {cz.coverUrl === p.url && (
              <span className="absolute left-1 top-1 rounded-full bg-ink px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-white">Cover</span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 px-2 py-1 text-[0.65rem] text-white opacity-0 transition group-hover:opacity-100">
              <button onClick={() => setCz((c) => ({ ...c, coverUrl: p.url }))}>Set cover</button>
              <button onClick={() => remove(p)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </Group>
  );
}

/* ─── Settings ─────────────────────────────────────────────── */

function SettingsPanel({
  siteId,
  slug,
  published,
  isProtected,
  names,
  onSlug,
  onPassword,
  translation,
  onTranslation,
  premium,
  pay,
}: {
  siteId: string;
  slug: string;
  published: boolean;
  isProtected: boolean;
  names: string;
  onSlug: (s: string) => Promise<void>;
  onPassword: (pw: string | null) => Promise<boolean>;
  translation?: Customization["translation"];
  onTranslation: (t: Customization["translation"]) => void;
  premium: boolean;
  pay: { live: boolean; amount: number; currency: string; features: string[]; justPaid: boolean; cancelled: boolean };
}) {
  const router = useRouter();
  const [value, setValue] = useState(slug);
  const [pw, setPw] = useState("");
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  async function del() {
    if (!confirm("Permanently delete this site, its photos and all RSVPs? This can't be undone.")) return;
    const res = await fetch(`/api/sites/${siteId}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard");
  }

  return (
    <>
      <Group title="Your link" hint="Share this with guests once you publish.">
        <div className="flex items-center gap-1 rounded-[10px] border border-line bg-white pl-3 text-sm">
          <span className="shrink-0 text-stone">{origin.replace(/^https?:\/\//, "")}/</span>
          <input className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 outline-none" value={value} maxLength={48} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button className="btn !py-2" disabled={value === slug} onClick={() => onSlug(value)}>
            Save link
          </button>
          <button className="btn btn-light !py-2" onClick={() => navigator.clipboard.writeText(`${origin}/${slug}`)}>
            Copy link
          </button>
        </div>
      </Group>
      {origin && <ShareTools url={`${origin}/${slug}`} names={names} published={published} />}

      <Group
        title="Privacy"
        hint={isProtected ? "Your site is password-protected. Guests must enter the password to see it." : "Anyone with your link can view your site."}
      >
        <div className="flex gap-2">
          <input
            className="field"
            type="text"
            value={pw}
            minLength={4}
            maxLength={100}
            autoComplete="off"
            placeholder={isProtected ? "New password" : "Set a guest password"}
            onChange={(e) => setPw(e.target.value)}
          />
          <button
            className="btn !px-4 !py-2"
            disabled={pw.trim().length < 4}
            onClick={async () => {
              if (await onPassword(pw.trim())) setPw("");
            }}
          >
            Save
          </button>
        </div>
        {isProtected && (
          <button className="text-sm text-stone underline" onClick={() => onPassword(null)}>
            Remove password
          </button>
        )}
      </Group>

      <PremiumGroup siteId={siteId} premium={premium} pay={pay} />

      <Group title="Second language" hint="Bilingual families? Translate your site with AI; guests switch languages with one tap.">
        <TranslatePanel translation={translation} onChange={(t) => onTranslation(t as Customization["translation"])} />
      </Group>

      <Group title="Guests">
        <Link href={`/dashboard/sites/${siteId}/guests`} className="btn btn-light w-full">
          RSVPs &amp; guestbook
        </Link>
      </Group>
      <Group title="Danger zone">
        <button className="btn w-full !bg-red-700" onClick={del}>
          Delete site
        </button>
      </Group>
    </>
  );
}

const FEATURE_LABEL: Record<string, string> = {
  ai: "AI writing assistant, theme matchmaker, translation & thank-you notes",
  guestHelper: "“Ask us anything” guest helper",
  password: "Password-protected site",
  branding: "No “Made with Vow” line",
};

function PremiumGroup({ siteId, premium, pay }: { siteId: string; premium: boolean; pay: { live: boolean; amount: number; currency: string; features: string[]; justPaid: boolean; cancelled: boolean } }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (!premium && !pay.live) return null;
  const price = new Intl.NumberFormat("en", { style: "currency", currency: pay.currency.toUpperCase() }).format(pay.amount / 100);
  async function upgrade() {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/pay/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ siteId }) }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok && data?.url) return void (window.location.href = data.url);
    setBusy(false);
    setErr(data?.error ?? "Couldn't start the payment.");
  }
  return (
    <div id="upgrade">
      <Group title="Premium" hint={premium ? undefined : `A one-time ${price} upgrade for this wedding site. No subscription.`}>
        {pay.justPaid && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Payment received. Thank you! This site is now Premium.</p>}
        {pay.cancelled && !premium && <p className="rounded-lg bg-[#f6efe4] px-3 py-2 text-sm">Payment cancelled. You haven&apos;t been charged.</p>}
        {premium ? (
          <p className="text-sm">
            <span className="mr-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Premium</span>
            Everything is unlocked for this site.
          </p>
        ) : (
          <>
            <ul className="space-y-1 text-sm">
              {pay.features.map((f) => (
                <li key={f}>✓ {FEATURE_LABEL[f] ?? f}</li>
              ))}
            </ul>
            <button type="button" className="btn w-full" disabled={busy} onClick={upgrade}>
              {busy ? "Opening secure checkout…" : `Upgrade for ${price}`}
            </button>
            {err && <p className="text-xs text-red-700">{err}</p>}
            <p className="text-xs text-stone">Secure payment by Stripe. You&apos;ll come straight back here afterwards.</p>
          </>
        )}
      </Group>
    </div>
  );
}

/** Phone photos are often 5-12 MB; scale them to 2400px (still sharp everywhere) so uploads stay under the host's 4.5 MB limit. */
async function shrinkPhoto(file: File): Promise<File> {
  if (file.size < 1.5 * 1024 * 1024 || !/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.86));
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}
