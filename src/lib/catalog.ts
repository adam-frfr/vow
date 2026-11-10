import "server-only";
import type { Family, Floral, FloralKind } from "./assets";
import { registerArt } from "./assets";
import { db } from "./db";
import { getJson, setJson } from "./settings";
import type { Catalog } from "./catalog-shared";

export type { Catalog } from "./catalog-shared";

const HIDDEN_KEY = "catalog.hidden";
type Hidden = { themes: string[]; designs: string[]; art: string[] };

let cache: { at: number; cat: Catalog } | null = null;

/**
 * What the admin has hidden, plus art they uploaded. Hidden items disappear
 * from the gallery and every picker; sites already using them keep working.
 */
export async function getCatalog(): Promise<Catalog> {
  if (cache && Date.now() - cache.at < 15_000) return cache.cat;
  const [hidden, rows] = await Promise.all([getJson<Hidden>(HIDDEN_KEY, { themes: [], designs: [], art: [] }), db.artAsset.findMany({ orderBy: { createdAt: "desc" } })]);
  const art: Floral[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    kind: r.kind as FloralKind,
    w: r.w,
    h: r.h,
    tone: r.tone === "light" ? "light" : "any",
    fam: r.fam ? (r.fam.split(",") as Family[]) : [],
    lib: true,
    custom: true,
  }));
  registerArt(art);
  const cat: Catalog = { hiddenThemes: hidden.themes ?? [], hiddenDesigns: hidden.designs ?? [], hiddenArt: hidden.art ?? [], art };
  cache = { at: Date.now(), cat };
  return cat;
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
