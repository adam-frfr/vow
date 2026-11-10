import { ALL_FLORALS, type Floral } from "./assets";
import { TEMPLATES, templateOf, THEMES } from "./themes";

/** Admin catalogue controls, safe to pass to the browser. */
export interface Catalog {
  hiddenThemes: string[];
  hiddenDesigns: string[];
  hiddenArt: string[];
  /** Art uploaded by the admin. */
  art: Floral[];
}

export const EMPTY_CATALOG: Catalog = { hiddenThemes: [], hiddenDesigns: [], hiddenArt: [], art: [] };

/** Themes couples can pick: not hidden themselves, and not built on a hidden design. */
export const visibleThemes = (c: Catalog = EMPTY_CATALOG) => THEMES.filter((t) => !c.hiddenThemes.includes(t.id) && !c.hiddenDesigns.includes(templateOf(t)));
export const visibleTemplates = (c: Catalog = EMPTY_CATALOG) => TEMPLATES.filter((t) => !c.hiddenDesigns.includes(t.id));
/** Art for pickers: built-in plus uploaded, minus hidden. */
export const visibleArt = (c: Catalog = EMPTY_CATALOG) => [...ALL_FLORALS.filter((a) => !a.custom), ...c.art].filter((a) => !c.hiddenArt.includes(a.id));
