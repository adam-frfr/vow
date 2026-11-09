/**
 * Couples' own decorations and effects: painted library art placed anywhere on
 * the page (moved, sized, turned freely) plus opt-in page effects.
 */
import { z } from "zod";

export const STICKER_ANIMS = {
  none: "No animation",
  ink: "Ink bloom",
  fade: "Fade in",
  rise: "Rise up",
  zoom: "Grow in",
  drift: "Drift in sideways",
  sway: "Gentle sway",
  float: "Float",
  spin: "Slow turn",
} as const;
export type StickerAnim = keyof typeof STICKER_ANIMS;

export const stickerSchema = z.object({
  id: z.string().max(24),
  asset: z.string().max(60),
  /** Section id the sticker travels with ("top" = the opening). */
  anchor: z.string().max(40),
  /** Centre x as % of page width. */
  x: z.number().min(-30).max(130),
  /** Centre y as % of the anchor's height (can sit below/above it). */
  y: z.number().min(-200).max(600),
  /** Width as % of page width. */
  w: z.number().min(3).max(140),
  r: z.number().min(-180).max(180).default(0),
  flip: z.boolean().optional(),
  o: z.number().min(0.1).max(1).optional(),
  anim: z.enum(Object.keys(STICKER_ANIMS) as [StickerAnim, ...StickerAnim[]]).optional(),
  /** Hide on phones (wide art can crowd a small screen). */
  hideMobile: z.boolean().optional(),
});
export type Sticker = z.infer<typeof stickerSchema>;

export const REVEALS = { none: "Off", fade: "Fade", rise: "Rise", zoom: "Grow", blur: "Soft focus", slide: "Slide" } as const;
export const AMBIENTS = { none: "Off", petals: "Falling petals", blossom: "Little blossoms", leaves: "Drifting leaves", hearts: "Painted hearts", tulips: "Tiny tulips" } as const;
export const AMOUNTS = { light: "A few", medium: "Some", heavy: "Lots" } as const;

export const effectsSchema = z.object({
  /** Sections animate in as guests scroll to them. */
  reveal: z.enum(Object.keys(REVEALS) as [keyof typeof REVEALS, ...(keyof typeof REVEALS)[]]).optional(),
  /** Painted sprites drifting down the page. */
  ambient: z.enum(Object.keys(AMBIENTS) as [keyof typeof AMBIENTS, ...(keyof typeof AMBIENTS)[]]).optional(),
  amount: z.enum(["light", "medium", "heavy"]).optional(),
  /** Watercolour paper/texture washed over the page background. */
  texture: z.string().max(60).optional(),
  textureStrength: z.number().min(0.05).max(1).optional(),
  /** Photos lift gently on hover. */
  photoHover: z.boolean().optional(),
});
export type Effects = z.infer<typeof effectsSchema>;

/** Painted sprites (cut from library art) for each ambient effect: /fx/<set>-<n>.webp */
export const AMBIENT_SPRITES: Record<Exclude<keyof typeof AMBIENTS, "none">, number> = { petals: 6, blossom: 7, leaves: 8, hearts: 8, tulips: 6 };

export function newStickerId() {
  return Math.random().toString(36).slice(2, 10);
}

/* ── Matching printed invitation card ───────────────────────────── */
export const CARD_STYLES = { wreath: "Wreath", crown: "Crown", corners: "Corners", liner: "Pattern border", minimal: "Minimal" } as const;
export const CARD_COLORWAYS = { theme: "Theme colours", inverse: "Dark card", paper: "Ivory paper" } as const;
export const CARD_FINISHES = { painted: "Painted", white: "White ink", gold: "Gold foil", ink: "Black ink" } as const;
const keys = <T extends object>(o: T) => Object.keys(o) as [keyof T & string, ...(keyof T & string)[]];

export const cardSchema = z.object({
  style: z.enum(keys(CARD_STYLES)).optional(),
  colorway: z.enum(keys(CARD_COLORWAYS)).optional(),
  finish: z.enum(keys(CARD_FINISHES)).optional(),
  /** Library art to use instead of the theme's. */
  art: z.string().max(60).optional(),
  /** Pattern for the "Pattern border" style. */
  pattern: z.string().max(60).optional(),
  top: z.string().max(80).optional(),
  invite: z.string().max(140).optional(),
  venue: z.string().max(100).optional(),
  place: z.string().max(100).optional(),
  extra: z.string().max(100).optional(),
  reply: z.string().max(120).optional(),
});
export type CardSettings = z.infer<typeof cardSchema>;
