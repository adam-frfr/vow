/**
 * Decor & style: the per-theme layer that makes themes sharing a site design
 * look and move differently, and that couples can override in the editor.
 */
import { z } from "zod";
import { CUTOUTS, FLORALS, type Family, type Floral } from "./assets";
import type { Theme, TemplateId } from "./themes";

export const decorSchema = z.object({
  corner: z.string().max(60).optional(), // painted corner spray(s) on the hero
  heroFloral: z.string().max(60).optional(), // wreath/frame/bouquet around the names
  divider: z.string().max(60).optional(), // garland/border between sections
  pattern: z.string().max(60).optional(), // chintz band
  scatter: z.string().max(60).optional(),
  cutout: z.string().max(60).optional(), // scroll-scrubbed footage cut-out
  cutoutAt: z.enum(["intro", "story", "rsvp"]).optional(),
  ink: z.boolean().optional(), // florals bloom in with ink on scroll
});
export type Decor = z.infer<typeof decorSchema>;

export const styleSchema = z.object({
  buttons: z.enum(["sharp", "soft", "pill"]).optional(),
  density: z.enum(["compact", "standard", "airy"]).optional(),
  headings: z.enum(["theme", "upper", "title", "italic"]).optional(),
  photo: z.enum(["none", "rounded", "arch", "circle", "polaroid"]).optional(),
  gallery: z.enum(["design", "grid", "masonry", "polaroid", "filmstrip", "mosaic"]).optional(),
  sections: z.enum(["alternate", "solid"]).optional(),
});
export type StyleAxes = z.infer<typeof styleSchema>;

export const STYLE_LABELS = {
  buttons: { sharp: "Sharp", soft: "Soft", pill: "Pill" },
  density: { compact: "Compact", standard: "Standard", airy: "Airy" },
  headings: { theme: "Theme default", upper: "Capitals", title: "Title case", italic: "Italic" },
  photo: { none: "Plain", rounded: "Rounded", arch: "Arched", circle: "Circles", polaroid: "Polaroids" },
  gallery: { design: "Design default", grid: "Even grid", masonry: "Masonry", polaroid: "Polaroid wall", filmstrip: "Film strip", mosaic: "Mosaic" },
  sections: { alternate: "Alternating tones", solid: "One tone" },
} as const;

/* ── Colour families, so florals match each palette ──────────────── */

export type { Family };

const FLORAL_FAMILY: Record<string, Family[]> = {
  "peony-pink": ["pink", "red"], "peony-purple": ["purple", "blue"], "peony-burgundy": ["red", "purple"],
  "bouquet-burgundy": ["red", "pink"], "bouquet-vintage": ["yellow", "red"], cosmos: ["pink", "yellow", "green"],
  "rose-stem-pink": ["pink"], "rose-vintage-red": ["red", "neutral"], "spray-pink": ["pink", "neutral"],
  "frame-gold-geo-pink": ["pink", "neutral"], "frame-gold-ring-plum": ["purple", "red"], "frame-gold-ring-blush": ["pink", "green", "neutral"],
  "frame-gold-rect-eucalyptus": ["green", "pink", "neutral"], "frame-gold-hydrangea": ["blue", "green"], "frame-gold-ring-bouquet": ["blue", "pink", "purple"],
  "frame-gold-square": ["pink", "blue"], "frame-gold-double-peach": ["yellow", "neutral", "pink"], "frame-gold-ring-violet": ["purple", "blue"],
  "frame-gold-rect-white": ["neutral", "green"], "frame-geo-greenery": ["green", "neutral"], "frame-yellow-roses": ["yellow", "green"],
  "frame-pink-roses": ["pink", "red"], "frame-roses-square": ["pink", "red"], "frame-meadow-rect": ["pink", "neutral"],
  "wreath-blush": ["pink", "blue"], "wreath-meadow": ["green", "pink", "purple"], "wreath-berry": ["red", "blue", "neutral"],
  "wreath-lush": ["red", "green", "neutral"], "wreath-lavender": ["purple"], "wreath-ring-floral": ["pink", "blue", "purple"],
  "wreath-eucalyptus-gold": ["green", "blue", "neutral"], "wreath-anemone": ["green", "neutral"], "wreath-tiny-roses": ["red", "pink", "neutral"],
  "corner-ornate": ["yellow", "blue", "pink"], "corner-tulips": ["yellow", "purple", "red"], "corner-pink": ["pink", "red"],
  "border-burgundy-double": ["red", "pink"], "border-pink-double": ["pink"], "border-greenery": ["green", "neutral"],
  "border-eucalyptus": ["green"], "garland-pink-roses": ["pink", "neutral"], "garland-navy": ["blue", "purple", "red"],
  "garland-blue-greenery": ["blue", "green"], "elements-pink": ["pink", "purple"], "elements-red": ["red", "green"],
  "pattern-chintz-teal": ["blue", "green", "neutral"], "pattern-pink-chintz": ["pink", "neutral"], "pattern-navy-roses": ["blue", "purple", "neutral"],
  "pattern-blue-roses": ["blue", "neutral"], "pattern-blue-white": ["blue", "neutral", "green"], "pattern-yellow-roses": ["yellow"],
  "pattern-red-roses": ["red", "green"], "pattern-ditsy": ["pink"], "pattern-pastel": ["pink", "yellow", "green"],
};

/** Colour families of any painted asset (original set or library). */
export function floralFamilies(f: Floral): Family[] {
  return FLORAL_FAMILY[f.id] ?? f.fam ?? [];
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
}

export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function familyOf(hex: string): Family {
  const [r, g, b] = hexToRgb(hex);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  if (sat < 0.18 || max < 0.18) return "neutral";
  let h = 0;
  if (max === r) h = ((g - b) / (max - min)) % 6;
  else if (max === g) h = (b - r) / (max - min) + 2;
  else h = (r - g) / (max - min) + 4;
  h = (h * 60 + 360) % 360;
  if (h < 15 || h >= 345) return "red";
  if (h < 45) return h < 28 ? "red" : "yellow";
  if (h < 70) return "yellow";
  if (h < 170) return "green";
  if (h < 255) return "blue";
  if (h < 300) return "purple";
  return "pink";
}

/* ── Defaults per theme ─────────────────────────────────────────── */

/** Which design architectures welcome painted florals / footage cut-outs. */
const FLORAL_FRIENDLY: TemplateId[] = ["classic", "grand", "stationery", "botanical", "letter", "storybook", "scrapbook", "split", "atelier", "bloom"];
const CUTOUT_FRIENDLY: TemplateId[] = ["classic", "grand", "cinematic", "letter", "split", "stationery", "storybook", "atelier", "candlelit", "bloom", "editorial", "voyage"];

/** Designs whose own gallery accepts the photo-frame style. */
const PHOTO_FRAME_OK: TemplateId[] = ["classic", "grand", "split", "candlelit", "bloom", "storybook"];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function pick<T>(list: T[], seed: number, offset = 0): T | undefined {
  return list.length ? list[(seed + offset) % list.length] : undefined;
}

function matching(kind: Floral["kind"][], fam: Family, dark: boolean): string[] {
  const ok = FLORALS.filter((x) => kind.includes(x.kind) && (!dark || x.tone === "any"));
  const best = ok.filter((x) => FLORAL_FAMILY[x.id]?.[0] === fam);
  const good = ok.filter((x) => FLORAL_FAMILY[x.id]?.includes(fam));
  const neutral = ok.filter((x) => FLORAL_FAMILY[x.id]?.includes("neutral"));
  return (best.length >= 2 ? best : good.length ? good : neutral.length ? neutral : ok).map((x) => x.id);
}

/**
 * Deterministic decor + style for a theme: florals matched to the palette,
 * cut-outs only where the background suits them, and style axes varied so
 * themes on the same design differ.
 */
export function defaultDecorStyle(theme: Theme, template: TemplateId): { decor: Decor; style: StyleAxes } {
  const seed = hash(theme.id);
  const dark = luminance(theme.palette.bg) < 0.12;
  const fam = familyOf(theme.palette.accent);
  const decor: Decor = {};

  if (FLORAL_FRIENDLY.includes(template) && theme.collection !== "modern" && theme.collection !== "city") {
    const level = seed % 4; // 0 none, 1 dividers, 2 corners+dividers, 3 corners+hero+dividers+pattern
    if (level >= 1 || template === "atelier") decor.divider = pick(matching(["garland", "border"], fam, dark), seed, 1);
    if (level >= 2 || template === "atelier") decor.corner = pick(matching(["corner", "bouquet"], fam, dark), seed, 2);
    if (level >= 3 || template === "atelier") {
      decor.heroFloral = pick(matching(["wreath", "frame"], fam, dark), seed, 3);
      if (!dark) decor.pattern = pick(matching(["pattern"], fam, dark), seed, 4);
    }
    decor.ink = template === "atelier" || seed % 3 !== 0;
  }

  if (CUTOUT_FRIENDLY.includes(template)) {
    const pool = CUTOUTS.filter((c) => (dark ? true : c.tone === "any"));
    const chance = template === "candlelit" || template === "bloom" ? 1 : seed % 5 === 0 ? 1 : 0;
    if (chance) {
      decor.cutout = template === "candlelit" ? "candle-lights" : pick(pool.map((c) => c.id), seed, 5);
      decor.cutoutAt = (["intro", "story", "rsvp"] as const)[seed % 3];
    }
  }

  const style: StyleAxes = {
    buttons: (["sharp", "soft", "pill"] as const)[(seed >> 3) % 3],
    density: (["compact", "standard", "airy"] as const)[(seed >> 5) % 3],
    headings: "theme",
    photo: PHOTO_FRAME_OK.includes(template) ? (["none", "rounded", "arch", "circle", "polaroid"] as const)[(seed >> 7) % 5] : "none",
    gallery: "design",
    sections: (seed >> 9) % 4 === 0 ? "solid" : "alternate",
  };
  if (template === "swiss" || template === "gazette") style.buttons = "sharp";
  if (template === "scrapbook" || template === "pop" || template === "storybook") style.buttons = "pill";
  return { decor, style };
}

export function resolveDecorStyle(theme: Theme, template: TemplateId, overrides: { decor?: Decor; style?: StyleAxes }) {
  const base = defaultDecorStyle(theme, template);
  const decor = { ...base.decor, ...(theme.decor ?? {}), ...(overrides.decor ?? {}) };
  // "none" from the editor clears a slot
  for (const k of Object.keys(decor) as (keyof Decor)[]) if (decor[k] === "none") delete decor[k];
  const style = { ...base.style, ...(theme.style ?? {}), ...(overrides.style ?? {}) };
  return { decor, style };
}
