import { z } from "zod";
import { floralUrl, getFloral } from "./assets";
import { FINISH_FILTERS } from "./decor";
import { AMBIENTS, REVEALS } from "./stickers";
import { FONT_CHOICES, TEMPLATE_IDS, THEMES, type CollectionId, type TemplateId, type Theme } from "./themes";

const HEX = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colours must be #RRGGBB.");

/** Fonts the builder offers: the editor's choices plus every font a built-in theme uses (all known to Google Fonts). */
export const BUILDER_FONTS = (() => {
  const all = new Set<string>([...FONT_CHOICES.display, ...FONT_CHOICES.body, ...FONT_CHOICES.script]);
  for (const t of THEMES) {
    if (t.id.startsWith("u-")) continue;
    all.add(t.fonts.display);
    all.add(t.fonts.body);
    if (t.fonts.script) all.add(t.fonts.script);
  }
  return [...all].sort((a, b) => a.localeCompare(b));
})();

const FONT = z.string().refine((f) => BUILDER_FONTS.includes(f), "Pick a font from the list.");

/** What the theme builder saves (validated on the server). */
export const themeInputSchema = z.object({
  name: z.string().trim().min(2, "Give the theme a name.").max(60),
  description: z.string().trim().max(240).default(""),
  tags: z.array(z.string().trim().min(1).max(24)).max(8).default([]),
  collection: z.string().regex(/^[a-z0-9-]{2,40}$/),
  template: z.string().refine((id) => (TEMPLATE_IDS as string[]).includes(id), "Unknown design."),
  /** Library art shown as the theme's main picture (an image, not an animation). */
  heroArt: z.string().max(80),
  palette: z.object({ bg: HEX, surface: HEX, text: HEX, muted: HEX, accent: HEX, onAccent: HEX }),
  fonts: z.object({ display: FONT, body: FONT, script: FONT.optional() }),
  finish: z.enum(["painted", "white", "gold", "ink"]).default("painted"),
  reveal: z.enum(Object.keys(REVEALS) as [keyof typeof REVEALS, ...(keyof typeof REVEALS)[]]).default("none"),
  ambient: z.enum(Object.keys(AMBIENTS) as [keyof typeof AMBIENTS, ...(keyof typeof AMBIENTS)[]]).default("none"),
  amount: z.enum(["light", "medium", "heavy"]).default("light"),
});
export type ThemeInput = z.infer<typeof themeInputSchema>;

export const isBuilderTheme = (id: string) => id.startsWith("u-");

/** Turns saved builder data into a real Theme the site can render. */
export function toTheme(id: string, d: ThemeInput): Theme {
  const art = getFloral(d.heroArt);
  const finish = d.finish === "painted" ? undefined : d.finish;
  return {
    id,
    name: d.name,
    collection: d.collection as CollectionId,
    description: d.description || `${d.name}: a custom theme.`,
    tags: d.tags,
    layout: "poster",
    hero: art ? floralUrl(art.id) : floralUrl("peony-pink"),
    palette: d.palette,
    fonts: d.fonts.script ? d.fonts : { display: d.fonts.display, body: d.fonts.body },
    template: d.template as TemplateId,
    decor: { heroFloral: art?.id, ...(finish ? { finish } : {}) },
    effects: {
      ...(d.reveal !== "none" ? { reveal: d.reveal } : {}),
      ...(d.ambient !== "none" ? { ambient: d.ambient, amount: d.amount } : {}),
    },
    heroFilter: finish ? FINISH_FILTERS[finish] : undefined,
  };
}

/** Builder data prefilled from any existing theme (for "Duplicate"). */
export function fromTheme(t: Theme): ThemeInput {
  const heroId = t.hero.match(/\/(?:library|florals)\/([a-z0-9-]+)\.webp$/)?.[1] ?? t.decor?.heroFloral ?? "peony-pink";
  return {
    name: `${t.name} copy`.slice(0, 60),
    description: t.description,
    tags: t.tags.slice(0, 8),
    collection: t.collection,
    template: t.template ?? "classic",
    heroArt: heroId,
    palette: t.palette,
    fonts: { display: BUILDER_FONTS.includes(t.fonts.display) ? t.fonts.display : "Cormorant Garamond", body: BUILDER_FONTS.includes(t.fonts.body) ? t.fonts.body : "Jost", ...(t.fonts.script && BUILDER_FONTS.includes(t.fonts.script) ? { script: t.fonts.script } : {}) },
    finish: t.decor?.finish ?? "painted",
    reveal: t.effects?.reveal ?? "none",
    ambient: t.effects?.ambient ?? "none",
    amount: t.effects?.amount ?? "light",
  };
}
