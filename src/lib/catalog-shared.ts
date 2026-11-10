import { ALL_FLORALS, registerArt, type Floral } from "./assets";
import { getTheme, registerCollections, registerThemes, TEMPLATES, templateOf, THEMES, type Theme } from "./themes";

export interface CollectionInfo {
  id: string;
  name: string;
  blurb: string;
  hidden: boolean;
  /** Made by the admin (can be deleted when empty). */
  custom: boolean;
}

export interface SectionInfo {
  id: string;
  name: string;
  hidden: boolean;
  /** Premium-only while payments are on. */
  locked: boolean;
}

/** Everything the admin controls about what couples see; safe to send to the browser. */
export interface Catalog {
  hiddenThemes: string[];
  hiddenDesigns: string[];
  hiddenArt: string[];
  /** Art and animations uploaded by the admin. */
  art: Floral[];
  /** Published themes made in the theme builder. */
  themes: Theme[];
  /** Every collection (built-in and custom), in the admin's order. */
  collections: CollectionInfo[];
  /** Themes the admin moved to another collection. */
  themeCollection: Record<string, string>;
  /** Premium-only themes and designs (only enforced while payments are on). */
  locked: { themes: string[]; designs: string[] };
  /** Library sections the admin created, in order. */
  sections: SectionInfo[];
  /** Payments are on, so Premium locks apply. */
  payLive: boolean;
}

export const EMPTY_CATALOG: Catalog = {
  hiddenThemes: [],
  hiddenDesigns: [],
  hiddenArt: [],
  art: [],
  themes: [],
  collections: [],
  themeCollection: {},
  locked: { themes: [], designs: [] },
  sections: [],
  payLive: false,
};

/** Makes admin-made themes, art and collection names known to this JS runtime (server or browser). */
export function applyCatalog(c: Catalog) {
  registerArt(c.art);
  registerThemes(c.themes, () => true);
  registerCollections(c.collections);
}

export const visibleCollections = (c: Catalog = EMPTY_CATALOG) => c.collections.filter((x) => !x.hidden);
export const collectionOf = (c: Catalog, t: Theme) => c.themeCollection[t.id] ?? t.collection;

/** Themes couples can pick: not hidden, not on a hidden design, not in a hidden collection (collection moves applied). */
export function visibleThemes(c: Catalog = EMPTY_CATALOG): Theme[] {
  const shown = new Set(visibleCollections(c).map((x) => x.id));
  const anyCollections = c.collections.length > 0;
  return THEMES.map((t) => (c.themeCollection[t.id] ? ({ ...t, collection: c.themeCollection[t.id] } as Theme) : t)).filter(
    (t) => !c.hiddenThemes.includes(t.id) && !c.hiddenDesigns.includes(templateOf(t)) && (!anyCollections || shown.has(t.collection)),
  );
}
export const visibleTemplates = (c: Catalog = EMPTY_CATALOG) => TEMPLATES.filter((t) => !c.hiddenDesigns.includes(t.id));

const sectionHidden = (c: Catalog, a: Floral) => !!a.section && (c.sections.find((s) => s.id === a.section)?.hidden ?? true);

/** Art for pickers: built-in plus uploaded, minus hidden pieces and hidden sections. */
export const visibleArt = (c: Catalog = EMPTY_CATALOG) =>
  [...ALL_FLORALS.filter((a) => !a.custom), ...c.art].filter((a) => !c.hiddenArt.includes(a.id) && !sectionHidden(c, a));

/** Is this Premium-only right now (payments on)? */
export function themeLocked(c: Catalog, themeId: string) {
  if (!c.payLive) return false;
  return c.locked.themes.includes(themeId) || c.locked.designs.includes(templateOf(getTheme(themeId)));
}
export const designLocked = (c: Catalog, id: string) => c.payLive && c.locked.designs.includes(id);
export const artLocked = (c: Catalog, a: Floral | undefined) => !!a?.section && c.payLive && !!c.sections.find((s) => s.id === a.section)?.locked;
