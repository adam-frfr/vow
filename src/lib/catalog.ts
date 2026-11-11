import "server-only";
import type { Family, Floral, FloralKind } from "./assets";
import { db } from "./db";
import { getBool, getJson, getSetting, setJson } from "./settings";
import { applyCatalog, EMPTY_CATALOG, type Catalog, type CollectionInfo } from "./catalog-shared";
import { themeInputSchema, toTheme } from "./custom-theme";
import { COLLECTIONS, registerThemes, type Theme } from "./themes";

export type { Catalog } from "./catalog-shared";

const HIDDEN_KEY = "catalog.hidden";
const META_KEY = "catalog.meta";
type Hidden = { themes: string[]; designs: string[]; art: string[] };

/** Admin-edited catalogue structure (kept as one JSON setting). */
export interface Meta {
  collections: {
    custom: { id: string; name: string; blurb: string }[];
    names: Record<string, { name: string; blurb: string }>;
    order: string[];
    hidden: string[];
  };
  themeCollection: Record<string, string>;
  locked: { themes: string[]; designs: string[] };
}

const EMPTY_META: Meta = { collections: { custom: [], names: {}, order: [], hidden: [] }, themeCollection: {}, locked: { themes: [], designs: [] } };

export async function getMeta(): Promise<Meta> {
  const m = await getJson<Partial<Meta>>(META_KEY, {});
  return {
    collections: { ...EMPTY_META.collections, ...(m.collections ?? {}) },
    themeCollection: m.themeCollection ?? {},
    locked: { ...EMPTY_META.locked, ...(m.locked ?? {}) },
  };
}

export async function setMeta(m: Meta) {
  await setJson(META_KEY, m);
  cache = null;
}

let cache: { at: number; cat: Catalog; drafts: Theme[] } | null = null;

function artFrom(r: { id: string; name: string; kind: string; w: number; h: number; tone: string; fam: string; section: string | null; format: string }): Floral {
  return {
    id: r.id,
    name: r.name,
    kind: r.kind as FloralKind,
    w: r.w,
    h: r.h,
    tone: r.tone === "light" ? "light" : "any",
    fam: r.fam ? (r.fam.split(",") as Family[]) : [],
    lib: true,
    custom: true,
    ...(r.section ? { section: r.section } : {}),
    ...(r.format === "lottie" ? { format: "lottie" as const } : {}),
  };
}

async function load() {
  const [hidden, meta, artRows, themeRows, sections, payOn, stripeKey] = await Promise.all([
    getJson<Hidden>(HIDDEN_KEY, { themes: [], designs: [], art: [] }),
    getMeta(),
    db.artAsset.findMany({ orderBy: { createdAt: "desc" } }),
    db.customTheme.findMany({ orderBy: { createdAt: "desc" } }),
    db.librarySection.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
    getBool("pay.enabled"),
    getSetting("stripe.secretKey"),
  ]);
  const art = artRows.map(artFrom);
  // Art first, so builder themes can point at uploaded art.
  applyCatalog({ ...EMPTY_CATALOG, art });

  const published: Theme[] = [];
  const drafts: Theme[] = [];
  for (const r of themeRows) {
    let raw: unknown;
    try {
      raw = JSON.parse(r.data);
    } catch {
      continue;
    }
    const parsed = themeInputSchema.safeParse(raw);
    if (!parsed.success) continue;
    (r.status === "published" ? published : drafts).push(toTheme(r.id, parsed.data));
  }
  // Drafts resolve by id (for the admin's preview) but are not listed.
  registerThemes([...published, ...drafts], (id) => published.some((t) => t.id === id));

  const base: CollectionInfo[] = [
    ...COLLECTIONS.map((c) => ({ id: c.id as string, name: c.name, blurb: c.blurb, hidden: false, custom: false })),
    ...meta.collections.custom.map((c) => ({ ...c, hidden: false, custom: true })),
  ].map((c) => ({ ...c, ...(meta.collections.names[c.id] ?? {}), hidden: meta.collections.hidden.includes(c.id) }));
  const rank = (id: string) => {
    const i = meta.collections.order.indexOf(id);
    return i < 0 ? 1000 + base.findIndex((c) => c.id === id) : i;
  };
  const collections = [...base].sort((a, b) => rank(a.id) - rank(b.id));

  const cat: Catalog = {
    hiddenThemes: hidden.themes ?? [],
    hiddenDesigns: hidden.designs ?? [],
    hiddenArt: hidden.art ?? [],
    art,
    themes: published,
    collections,
    themeCollection: meta.themeCollection,
    locked: meta.locked,
    sections: sections.map((s) => ({ id: s.id, name: s.name, hidden: s.hidden, locked: s.locked })),
    payLive: payOn && !!stripeKey,
  };
  applyCatalog(cat);
  return { cat, drafts };
}

/**
 * Everything the admin controls: hidden items, builder themes, collections,
 * library sections, uploaded art and Premium locks. Cached briefly.
 */
export async function getCatalog(): Promise<Catalog> {
  if (cache && Date.now() - cache.at < 15_000) return cache.cat;
  try {
    const { cat, drafts } = await load();
    cache = { at: Date.now(), cat, drafts };
    return cat;
  } catch (e) {
    console.warn("⚠️ Database unreachable during getCatalog(), using default built-in catalog:", e);
    const fallback: Catalog = {
      ...EMPTY_CATALOG,
      collections: COLLECTIONS.map((c) => ({ id: c.id as string, name: c.name, blurb: c.blurb, hidden: false, custom: false })),
    };
    applyCatalog(fallback);
    return fallback;
  }
}

/** Draft builder themes (admins only). */
export async function getDraftThemes(): Promise<Theme[]> {
  await getCatalog();
  return cache?.drafts ?? [];
}

export async function setHidden(kind: keyof Hidden, id: string, hidden: boolean) {
  const cur = await getJson<Hidden>(HIDDEN_KEY, { themes: [], designs: [], art: [] });
  const set = new Set(cur[kind] ?? []);
  if (hidden) set.add(id);
  else set.delete(id);
  await setJson(HIDDEN_KEY, { ...cur, [kind]: [...set] });
  cache = null;
}

export function forgetCatalog() {
  cache = null;
}
