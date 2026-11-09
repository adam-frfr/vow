/**
 * Self-hosted art assets (public/florals, public/cutouts).
 *
 * Florals: watercolour/painted illustrations from Pixabay (Pixabay Content
 * License: free for commercial use, no attribution required), cut out to
 * transparent WebP with colour-to-alpha so soft washes stay soft.
 *
 * Cut-outs: frame sequences from Pexels footage (Pexels License) shot on black,
 * background removed, scrubbed by scroll position.
 */
import { LIBRARY } from "./library";

export type FloralKind = "bouquet" | "frame" | "wreath" | "corner" | "border" | "garland" | "elements" | "pattern" | "texture";
export type Family = "pink" | "red" | "purple" | "blue" | "green" | "yellow" | "neutral";

export interface Floral {
  id: string;
  name: string;
  kind: FloralKind;
  /** "light": pale washes that only read on light backgrounds. */
  tone: "any" | "light";
  w: number;
  h: number;
  /** Lives in the newer /library folder (with a /library/t thumbnail). */
  lib?: boolean;
  /** Dominant colour families, most prominent first. */
  fam?: Family[];
}

const f = (id: string, name: string, kind: FloralKind, w: number, h: number, tone: Floral["tone"] = "any"): Floral => ({ id, name, kind, w, h, tone });

export const FLORALS: Floral[] = [
  // bouquets & single stems
  f("peony-pink", "Pink peonies", "bouquet", 841, 1280),
  f("peony-purple", "Lavender peonies", "bouquet", 945, 1070),
  f("peony-burgundy", "Burgundy peony", "bouquet", 449, 466),
  f("bouquet-burgundy", "Burgundy bouquet", "bouquet", 973, 929),
  f("bouquet-vintage", "Vintage roses", "bouquet", 1020, 1280),
  f("cosmos", "Cosmos", "bouquet", 1204, 1280),
  f("rose-stem-pink", "Garden rose stem", "bouquet", 748, 1224, "light"),
  f("rose-vintage-red", "Antique red rose", "bouquet", 909, 1274, "light"),
  f("spray-pink", "Pink anemone spray", "garland", 1280, 534),
  // frames
  f("frame-gold-geo-pink", "Gold geometric · blush roses", "frame", 1213, 1280),
  f("frame-gold-ring-plum", "Gold ring · plum florals", "frame", 1280, 1059),
  f("frame-gold-ring-blush", "Gold ring · blush posy", "frame", 1169, 1214),
  f("frame-gold-rect-eucalyptus", "Gold frame · eucalyptus", "frame", 877, 1280),
  f("frame-gold-hydrangea", "Gold frame · hydrangea", "frame", 1280, 1069),
  f("frame-gold-ring-bouquet", "Gold ring · wild bouquet", "frame", 1099, 1070),
  f("frame-gold-square", "Gold square · garden roses", "frame", 1265, 1263),
  f("frame-gold-double-peach", "Double gold ring · peach", "frame", 1192, 1152),
  f("frame-gold-ring-violet", "Gold ring · violet", "frame", 1280, 1275),
  f("frame-gold-rect-white", "Gold frame · white roses", "frame", 911, 1238),
  f("frame-geo-greenery", "Geometric greenery", "frame", 1259, 1280),
  f("frame-yellow-roses", "Yellow roses ring", "frame", 1220, 907),
  f("frame-pink-roses", "Pink rose border", "frame", 933, 1280),
  f("frame-roses-square", "Rose garden square", "frame", 1280, 1280),
  f("frame-meadow-rect", "Meadow rectangle", "frame", 1280, 973),
  // wreaths
  f("wreath-blush", "Blush wreath", "wreath", 1272, 1248),
  f("wreath-meadow", "Meadow wreath", "wreath", 1179, 1182),
  f("wreath-berry", "Berry wreath", "wreath", 1080, 1111),
  f("wreath-lush", "Lush garden wreath", "wreath", 1089, 1068),
  f("wreath-lavender", "Lavender wreath", "wreath", 1271, 1264),
  f("wreath-ring-floral", "Painted floral ring", "wreath", 1133, 1055),
  f("wreath-eucalyptus-gold", "Eucalyptus & gold", "wreath", 1127, 1280),
  f("wreath-anemone", "Anemone & eucalyptus", "wreath", 1270, 1269),
  f("wreath-tiny-roses", "Tiny rose ring", "wreath", 1280, 1280),
  // corners
  f("corner-ornate", "Ornate painted corner", "corner", 1280, 1275, "light"),
  f("corner-tulips", "Tulip corner", "corner", 1122, 1123),
  f("corner-pink", "Pink blossom corner", "corner", 1259, 1218),
  // borders & garlands
  f("border-burgundy-double", "Burgundy rose borders", "border", 1280, 1280),
  f("border-pink-double", "Pink peony borders", "border", 1280, 1070, "light"),
  f("border-greenery", "Greenery borders", "border", 1262, 1040),
  f("border-eucalyptus", "Eucalyptus borders", "border", 1232, 1280, "light"),
  f("garland-pink-roses", "Pink rose garland", "garland", 1280, 339),
  f("garland-navy", "Navy & berry garland", "garland", 1280, 538),
  f("garland-blue-greenery", "Blue greenery garland", "garland", 1280, 1196),
  // scatter
  f("elements-pink", "Pink petals & leaves", "elements", 1280, 1209),
  f("elements-red", "Red buds & leaves", "elements", 864, 1223),
  // patterns (opaque tiles)
  f("pattern-chintz-teal", "Chintz on teal", "pattern", 1280, 1280),
  f("pattern-pink-chintz", "Pink chintz", "pattern", 1280, 1280),
  f("pattern-navy-roses", "Navy roses", "pattern", 1280, 1280),
  f("pattern-blue-roses", "Blue roses", "pattern", 1280, 1280),
  f("pattern-blue-white", "Blue & white florals", "pattern", 1280, 1280),
  f("pattern-yellow-roses", "Yellow roses", "pattern", 1280, 1280),
  f("pattern-red-roses", "Red roses", "pattern", 1280, 1280),
  f("pattern-ditsy", "Ditsy pink", "pattern", 1280, 904),
  f("pattern-pastel", "Pastel florals", "pattern", 1280, 1280),
];

const ALL: Floral[] = [...FLORALS, ...LIBRARY];
const BY_ID = new Map(ALL.map((x) => [x.id, x]));

/** Every painted asset: the original set plus the library. */
export const ALL_FLORALS = ALL;
export const floralUrl = (id: string) => (BY_ID.get(id)?.lib ? `/library/${id}.webp` : `/florals/${id}.webp`);
/** Small preview for pickers (originals are already light enough). */
export const floralThumb = (id: string) => (BY_ID.get(id)?.lib ? `/library/t/${id}.webp` : `/florals/${id}.webp`);
export const getFloral = (id?: string) => (id ? BY_ID.get(id) : undefined);
export const floralsOf = (kind: FloralKind | FloralKind[]) => ALL.filter((x) => (Array.isArray(kind) ? kind : [kind]).includes(x.kind));

export interface Cutout {
  id: string;
  name: string;
  frames: number;
  w: number;
  h: number;
  /** glow = light-emitting (reads best on dark backgrounds) */
  mode: "glow" | "solid";
  tone: "any" | "dark";
  blurb: string;
}

export const CUTOUTS: Cutout[] = [
  { id: "candle-lights", name: "Candle lights up", frames: 90, w: 787, h: 720, mode: "glow", tone: "dark", blurb: "A candle catches its flame as guests scroll." },
  { id: "match-strike", name: "Match strike", frames: 90, w: 640, h: 1146, mode: "glow", tone: "dark", blurb: "One match lights another." },
  { id: "gold-glitter", name: "Gold glitter", frames: 32, w: 400, h: 711, mode: "glow", tone: "dark", blurb: "A burst of golden glitter drifts apart." },
  { id: "dandelion", name: "Dandelion opens", frames: 110, w: 627, h: 592, mode: "solid", tone: "any", blurb: "A bud unfurls into a seed head." },
  { id: "orchid", name: "Orchid blooms", frames: 100, w: 1100, h: 719, mode: "solid", tone: "any", blurb: "A spray of orchid buds opens." },
  { id: "daffodil", name: "Daffodil opens", frames: 90, w: 601, h: 641, mode: "solid", tone: "any", blurb: "A daffodil opens towards the viewer." },
];

export const getCutout = (id?: string) => CUTOUTS.find((c) => c.id === id);
export const cutoutFrame = (id: string, i: number) => `/cutouts/${id}/${String(i).padStart(3, "0")}.webp`;

export const INK = { id: "ink-bloom", frames: 70, w: 640, h: 360 };
export const inkFrame = (i: number) => `/cutouts/ink-bloom/${String(i).padStart(3, "0")}.webp`;
