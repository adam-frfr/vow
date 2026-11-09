/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { InviteSite } from "@/components/invite/InviteSite";
import { SECTION_LABELS, type Customization, type InviteContent, type SectionId } from "@/lib/content";
import { COLLECTIONS, FONT_CHOICES, getTheme, img, THEMES, type CollectionId } from "@/lib/themes";

type Photo = { id: string; url: string };
type Tab = "design" | "content" | "sections" | "photos" | "settings";
type SaveState = "saved" | "saving" | "unsaved" | "error";

export function Editor({
  site,
  initialContent,
  initialCustomization,
  initialPhotos,
}: {
  site: { id: string; slug: string; themeId: string; published: boolean };
  initialContent: InviteContent;
  initialCustomization: Customization;
  initialPhotos: Photo[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("design");
  const [themeId, setThemeId] = useState(site.themeId);
  const [content, setContent] = useState(initialContent);
  const [cz, setCz] = useState(initialCustomization);
  const [photos, setPhotos] = useState(initialPhotos);
  const [slug, setSlug] = useState(site.slug);
  const [published, setPublished] = useState(site.published);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [save, setSave] = useState<SaveState>("saved");
  const [notice, setNotice] = useState("");
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);

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

  async function togglePublish() {
    const data = await persist({ published: !published, themeId, content, customization: cz });
    if (data) {
      setPublished(data.published);
      setNotice(data.published ? "Your site is live! 🎉" : "Site unpublished.");
      router.refresh();
    }
  }

  return (
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
          <nav className="flex shrink-0 border-b border-line text-sm">
            {(["design", "content", "sections", "photos", "settings"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 border-b-2 py-3 capitalize ${tab === t ? "border-ink font-medium text-ink" : "border-transparent text-stone"}`}
              >
                {t}
              </button>
            ))}
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {tab === "design" && <DesignPanel themeId={themeId} setThemeId={setThemeId} cz={cz} setCz={setCz} photos={photos} />}
            {tab === "content" && <ContentPanel c={content} patch={patch} />}
            {tab === "sections" && <SectionsPanel c={content} setContent={setContent} />}
            {tab === "photos" && (
              <PhotosPanel siteId={site.id} photos={photos} setPhotos={setPhotos} cz={cz} setCz={setCz} onNotice={setNotice} />
            )}
            {tab === "settings" && (
              <SettingsPanel
                siteId={site.id}
                slug={slug}
                onSlug={async (s) => {
                  const d = await persist({ slug: s });
                  if (d) {
                    setSlug(d.slug);
                    setNotice("Link updated.");
                  }
                }}
              />
            )}
          </div>
        </aside>

        {/* Preview */}
        <section className={`${showPreviewMobile ? "block" : "hidden"} min-w-0 flex-1 overflow-y-auto lg:block`}>
          <div className={`mx-auto my-6 overflow-hidden bg-white shadow-xl transition-all ${device === "mobile" ? "w-[390px] rounded-[2rem] border-[10px] border-ink" : "w-[calc(100%-3rem)] max-w-[1280px] rounded-xl"}`}>
            <InviteSite themeId={themeId} content={content} customization={cz} photos={photos.map((p) => p.url)} mode="preview" />
          </div>
        </section>
      </div>

      {notice && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm text-white shadow-lg">{notice}</div>
      )}
    </div>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
  type?: string;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {multiline ? (
        <textarea className="field min-h-28" value={value} placeholder={placeholder} maxLength={max} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="field" type={type} value={value} placeholder={placeholder} maxLength={max} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
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
      <Group title="Theme" hint="Switch any time. Your words and photos stay put.">
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
          {THEMES.filter((t) => filter === "all" || t.collection === filter).map((t) => (
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
                  className={`h-full w-full ${t.layout === "botanical" ? "object-contain p-2 mix-blend-multiply" : "object-cover"}`}
                  style={t.heroFilter ? { filter: t.heroFilter } : undefined}
                />
              </div>
              <div className="truncate px-1.5 py-1 text-[0.7rem]">{t.name}</div>
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

function ContentPanel({ c, patch }: { c: InviteContent; patch: <K extends keyof InviteContent>(k: K, v: InviteContent[K]) => void }) {
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
        <Text label="Headline" value={c.headline} onChange={(v) => patch("headline", v)} placeholder="Together with their families" max={120} />
        <Text label="Tagline" value={c.tagline} onChange={(v) => patch("tagline", v)} placeholder="invite you to celebrate their wedding" max={200} />
      </Group>

      <Group title="Our story">
        <Text label="Your story" multiline value={c.story.body} onChange={(v) => patch("story", { body: v })} max={4000} />
      </Group>

      <Group title="Ceremony & reception">
        {ev("ceremony", "Ceremony")}
        {ev("reception", "Reception")}
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
        <Text label="Details" multiline value={c.travel.body} onChange={(v) => patch("travel", { body: v })} max={3000} />
      </Group>

      <Group title="Dress code">
        <Text label="Details" multiline value={c.dressCode.body} onChange={(v) => patch("dressCode", { body: v })} max={1000} />
      </Group>

      <Group title="Registry">
        <Text label="Message" multiline value={c.registry.body} onChange={(v) => patch("registry", { ...c.registry, body: v })} max={1000} />
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
        {c.faq.items.length < 30 && (
          <button className="btn btn-light w-full" onClick={() => patch("faq", { items: [...c.faq.items, { q: "", a: "" }] })}>
            + Add question
          </button>
        )}
      </Group>

      <Group title="RSVP">
        <Text label="Reply by" type="date" value={c.rsvp.deadline} onChange={(v) => patch("rsvp", { ...c.rsvp, deadline: v })} />
        <Text label="Message" multiline value={c.rsvp.body} onChange={(v) => patch("rsvp", { ...c.rsvp, body: v })} max={500} />
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
    const fd = new FormData();
    [...files].forEach((f) => fd.append("files", f));
    const res = await fetch(`/api/sites/${siteId}/photos`, { method: "POST", body: fd }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setBusy(false);
    if (res?.ok) {
      setPhotos((p) => [...p, ...data.photos]);
      onNotice(`${data.photos.length} photo${data.photos.length > 1 ? "s" : ""} added.`);
    } else onNotice(data?.error ?? "Upload failed.");
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

function SettingsPanel({ siteId, slug, onSlug }: { siteId: string; slug: string; onSlug: (s: string) => Promise<void> }) {
  const router = useRouter();
  const [value, setValue] = useState(slug);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

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
      <Group title="Guests">
        <Link href={`/dashboard/sites/${siteId}/guests`} className="btn btn-light w-full">
          View RSVPs
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
