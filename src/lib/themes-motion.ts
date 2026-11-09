/**
 * Themes built on the painted-floral and scroll-animated designs.
 * Florals: Pixabay (Pixabay Content License). Footage: Pexels (Pexels License).
 */
import type { Decor } from "./decor";
import type { CollectionId, HeroLayout, TemplateId, Theme } from "./themes";

type Pal = [bg: string, surface: string, text: string, muted: string, accent: string, onAccent: string];
type Fonts = [display: string, body: string, script?: string];

function t(
  id: string,
  name: string,
  collection: CollectionId,
  template: TemplateId,
  hero: string,
  layout: HeroLayout,
  [bg, surface, text, muted, accent, onAccent]: Pal,
  [display, body, script]: Fonts,
  decor: Decor,
  description: string,
  tags: string[],
): Theme {
  return {
    id, name, collection, template, hero, layout, description, tags, decor,
    palette: { bg, surface, text, muted, accent, onAccent },
    fonts: { display, body, script },
  };
}

const FL = (id: string) => `/florals/${id}.webp`;
const LAST = (id: string, n: number) => `/cutouts/${id}/${String(n).padStart(3, "0")}.webp`;
const CANDLE = "https://images.unsplash.com/photo-1640085461451-e3dc47415dd1";
const CANDLES = "https://images.unsplash.com/photo-1572008229252-6f35ba007c37";

export const MOTION_THEMES: Theme[] = [
  // ─── Watercolour Atelier ─────────────────────────────────────────
  t("atelier-peony", "Peony Atelier", "watercolour", "atelier", FL("wreath-blush"), "botanical",
    ["#FBF4F1", "#F5E6E1", "#3E2C2C", "#8F7672", "#B76E79", "#FFFFFF"], ["Cormorant Garamond", "Lato", "Pinyon Script"],
    { heroFloral: "wreath-blush", corner: "corner-pink", divider: "garland-pink-roses", pattern: "pattern-pink-chintz", scatter: "peony-pink", ink: true },
    "Blush peonies painted in watercolour bloom onto the page as guests scroll.", ["watercolour", "pink", "peony"]),
  t("atelier-plum", "Plum & Gold", "watercolour", "atelier", FL("frame-gold-ring-plum"), "botanical",
    ["#F8F3F6", "#EFE4EB", "#2F2230", "#7E6A7C", "#6E3B5C", "#FFFFFF"], ["Playfair Display", "Montserrat", "Great Vibes"],
    { heroFloral: "frame-gold-ring-plum", corner: "peony-burgundy", divider: "garland-navy", pattern: "pattern-navy-roses", scatter: "peony-purple", ink: true },
    "Deep plum blooms on a gilded ring, with navy rose chintz.", ["plum", "gold", "watercolour"]),
  t("atelier-hydrangea", "Blue Hydrangea", "watercolour", "atelier", FL("frame-gold-hydrangea"), "botanical",
    ["#F3F7FA", "#E3ECF3", "#1F2E3D", "#687889", "#3F6E9A", "#FFFFFF"], ["Cormorant Garamond", "Jost", "Italianno"],
    { heroFloral: "frame-gold-hydrangea", divider: "garland-blue-greenery", pattern: "pattern-blue-white", scatter: "peony-purple", ink: true },
    "Painted blue hydrangeas beneath a gold frame. Cool, calm and coastal.", ["blue", "hydrangea", "watercolour"]),
  t("atelier-eucalyptus", "Eucalyptus Atelier", "watercolour", "atelier", FL("wreath-eucalyptus-gold"), "botanical",
    ["#F4F6F1", "#E6EBE1", "#24302A", "#6C7A70", "#5E7A64", "#FFFFFF"], ["Marcellus", "Karla", "Allura"],
    { heroFloral: "wreath-eucalyptus-gold", divider: "border-greenery", pattern: "pattern-chintz-teal", scatter: "cosmos", ink: true },
    "Silver-green eucalyptus and a fine gold ring. Modern botanical.", ["green", "eucalyptus", "watercolour"]),
  t("atelier-lavender", "Lavender Garden", "watercolour", "atelier", FL("wreath-lavender"), "botanical",
    ["#F7F5FA", "#ECE8F3", "#2E2840", "#776F8A", "#7A68A6", "#FFFFFF"], ["Cormorant Garamond", "Raleway", "Parisienne"],
    { heroFloral: "wreath-lavender", divider: "garland-blue-greenery", pattern: "pattern-pastel", scatter: "peony-purple", ink: true },
    "A painted lavender wreath and pastel florals. Provençal and soft.", ["lavender", "purple", "watercolour"]),
  t("atelier-chintz", "Chintz Tea Room", "watercolour", "atelier", FL("wreath-tiny-roses"), "botanical",
    ["#FBF7F1", "#F2EADF", "#3B2B26", "#8C786C", "#A65A5A", "#FFFFFF"], ["Libre Baskerville", "Lato", "Pinyon Script"],
    { heroFloral: "wreath-tiny-roses", corner: "corner-ornate", divider: "garland-pink-roses", pattern: "pattern-chintz-teal", scatter: "bouquet-vintage", ink: true },
    "Grandmother's tea-room chintz, tiny rose rings and an ornate painted corner.", ["vintage", "chintz", "roses"]),
  t("atelier-sunshine", "Yellow Rose", "watercolour", "atelier", FL("frame-yellow-roses"), "botanical",
    ["#FFFBEF", "#FBF1D3", "#33291A", "#8A7A5C", "#B8860B", "#FFFFFF"], ["Fraunces", "Nunito", "Sacramento"],
    { heroFloral: "frame-yellow-roses", corner: "corner-tulips", divider: "border-greenery", pattern: "pattern-yellow-roses", scatter: "bouquet-vintage", ink: true },
    "Sunny yellow roses and tulip corners. Pure summer joy.", ["yellow", "roses", "summer"]),
  t("atelier-anemone", "White Anemone", "watercolour", "atelier", FL("wreath-anemone"), "botanical",
    ["#FAFAF7", "#EFF0EA", "#1F2622", "#6A716C", "#3B4A42", "#FFFFFF"], ["Italiana", "Jost", "Italianno"],
    { heroFloral: "wreath-anemone", divider: "border-eucalyptus", pattern: "pattern-blue-white", scatter: "rose-stem-pink", ink: true },
    "White anemones and eucalyptus on crisp paper. Elegant and fresh.", ["white", "anemone", "minimal"]),
  t("atelier-burgundy", "Burgundy Rose", "watercolour", "atelier", FL("wreath-berry"), "botanical",
    ["#FBF6F3", "#F2E6E1", "#2E1A1D", "#86686B", "#7E2433", "#FFFFFF"], ["Cinzel", "Cormorant Garamond", "Pinyon Script"],
    { heroFloral: "wreath-berry", corner: "peony-burgundy", divider: "border-burgundy-double", pattern: "pattern-red-roses", scatter: "bouquet-burgundy", ink: true },
    "Wine-dark roses and berries. Romantic autumn richness.", ["burgundy", "roses", "autumn"]),
  t("atelier-meadow", "Painted Meadow", "watercolour", "atelier", FL("wreath-meadow"), "botanical",
    ["#F8FAF3", "#ECF1E2", "#26301F", "#6E7864", "#6D8B4A", "#FFFFFF"], ["Fraunces", "Karla", "Caveat"],
    { heroFloral: "wreath-meadow", corner: "corner-tulips", divider: "garland-blue-greenery", pattern: "pattern-ditsy", scatter: "cosmos", ink: true },
    "A hand-painted wildflower meadow. Relaxed and garden-party sweet.", ["meadow", "wildflowers", "green"]),
  t("atelier-gilded", "Gilded Peach", "watercolour", "atelier", FL("frame-gold-double-peach"), "botanical",
    ["#FDF8F2", "#F6EBDD", "#3A2B20", "#8E7A68", "#B38652", "#FFFFFF"], ["Bodoni Moda", "Montserrat", "Great Vibes"],
    { heroFloral: "frame-gold-double-peach", corner: "corner-pink", divider: "garland-pink-roses", pattern: "pattern-pastel", scatter: "spray-pink", ink: true },
    "Peach blooms on double gold rings. Champagne-soft luxury.", ["peach", "gold", "luxury"]),
  t("atelier-nocturne", "Midnight Garden", "watercolour", "atelier", FL("wreath-lush"), "poster",
    ["#1B1A24", "#24222F", "#F1EBDF", "#ABA3B2", "#E2B97A", "#1B1A24"], ["Cormorant Garamond", "Jost", "Pinyon Script"],
    { heroFloral: "wreath-lush", corner: "corner-tulips", divider: "garland-navy", scatter: "peony-burgundy", ink: true },
    "Painted florals glowing on midnight paper. Moody and romantic.", ["dark", "moody", "watercolour"]),

  // ─── Candlelit (scroll lights a real candle) ─────────────────────
  t("candlelit-noir", "Candlelit Noir", "animated", "candlelit", CANDLE, "fullbleed",
    ["#0D0B0A", "#171412", "#F2E9DC", "#A89A8A", "#E2B270", "#0D0B0A"], ["Cormorant Garamond", "Jost", "Pinyon Script"],
    { cutout: "candle-lights" },
    "Scroll, and a real candle catches its flame. An intimate evening invitation.", ["candle", "dark", "animated"]),
  t("candlelit-velvet", "Velvet Candlelight", "animated", "candlelit", CANDLES, "fullbleed",
    ["#1A0B0E", "#241216", "#F3E3DA", "#B79A93", "#D9A36A", "#1A0B0E"], ["Cinzel", "Cormorant Garamond", "Pinyon Script"],
    { cutout: "candle-lights" },
    "Burgundy velvet and candlelight. Opulent and warm.", ["burgundy", "candle", "animated"]),
  t("candlelit-emerald", "Emerald Vigil", "animated", "candlelit", CANDLE, "fullbleed",
    ["#0B1612", "#13201B", "#EAF0E8", "#9DAEA3", "#D8B86A", "#0B1612"], ["Playfair Display", "Lato", "Great Vibes"],
    { cutout: "candle-lights" },
    "Deep emerald night and a single flame. Old-world elegance.", ["emerald", "candle", "animated"]),
  t("candlelit-spark", "First Spark", "animated", "candlelit", CANDLE, "fullbleed",
    ["#0B0D16", "#141725", "#EEF0F6", "#A0A6B8", "#F0A35A", "#0B0D16"], ["Bodoni Moda", "Jost", "Italianno"],
    { cutout: "match-strike" },
    "One match lights another as you scroll: the spark that started it all.", ["match", "spark", "animated"]),
  t("candlelit-gala", "Golden Gala", "animated", "candlelit", "https://images.unsplash.com/photo-1786367242319-6c05d668aaca", "fullbleed",
    ["#110E08", "#1B1710", "#F5ECD8", "#B2A486", "#E5C07B", "#110E08"], ["Italiana", "Jost", "Pinyon Script"],
    { cutout: "gold-glitter" },
    "A burst of real gold glitter opens a black-tie celebration.", ["gold", "glitter", "animated"]),

  // ─── Garden Bloom (a real flower opens as you scroll) ────────────
  t("bloom-wish", "Make a Wish", "animated", "bloom", LAST("dandelion", 110), "botanical",
    ["#F6F5EF", "#ECEBE1", "#262A1E", "#72766A", "#6F7F4E", "#FFFFFF"], ["Fraunces", "Karla", "Caveat"],
    { cutout: "dandelion", divider: "border-greenery", ink: true },
    "A real dandelion bud opens into a wish as guests scroll your story.", ["dandelion", "animated", "green"]),
  t("bloom-wish-night", "Wishing Night", "animated", "bloom", LAST("dandelion", 110), "poster",
    ["#121414", "#1B1E1E", "#EDEBE2", "#A3A69E", "#E8E2C9", "#121414"], ["Cormorant Garamond", "Jost", "Pinyon Script"],
    { cutout: "dandelion" },
    "A dandelion unfurls in the dark, like a wish made at midnight.", ["dandelion", "dark", "animated"]),
  t("bloom-wish-blush", "Blush Wish", "animated", "bloom", LAST("dandelion", 110), "botanical",
    ["#FBF3F2", "#F4E3E1", "#3B2A2A", "#8F7775", "#C07A7A", "#FFFFFF"], ["Playfair Display", "Quicksand", "Sacramento"],
    { cutout: "dandelion", divider: "garland-pink-roses", ink: true },
    "A dandelion wish with painted blush roses between chapters.", ["dandelion", "pink", "animated"]),
  t("bloom-orchid", "Orchid Morning", "animated", "bloom", LAST("orchid", 100), "botanical",
    ["#F7F4F8", "#EDE6EF", "#2B2430", "#7B7180", "#8A5FA8", "#FFFFFF"], ["Cormorant Garamond", "Jost", "Italianno"],
    { cutout: "orchid", divider: "garland-navy", ink: true },
    "A spray of orchid buds opens petal by petal as you read.", ["orchid", "purple", "animated"]),
  t("bloom-orchid-noir", "Orchid Noir", "animated", "bloom", LAST("orchid", 100), "poster",
    ["#0F0D12", "#18151C", "#EFE9F2", "#A79FAD", "#C9A6E0", "#0F0D12"], ["Bodoni Moda", "Jost", "Pinyon Script"],
    { cutout: "orchid" },
    "Orchids blooming out of black. Couture and quietly dramatic.", ["orchid", "dark", "animated"]),
  t("bloom-daffodil", "Spring Daffodil", "animated", "bloom", LAST("daffodil", 90), "botanical",
    ["#FFFCEE", "#FBF2D1", "#2E2A18", "#857C5C", "#B8860B", "#FFFFFF"], ["Playfair Display", "Nunito", "Dancing Script"],
    { cutout: "daffodil", divider: "border-greenery", ink: true },
    "A real daffodil opens towards your guests. Fresh as a spring morning.", ["daffodil", "yellow", "animated"]),
  t("bloom-daffodil-dusk", "Daffodil Dusk", "animated", "bloom", LAST("daffodil", 90), "poster",
    ["#10120D", "#191C15", "#F1F0E4", "#A6A890", "#EED45A", "#10120D"], ["Fraunces", "Karla", "Caveat"],
    { cutout: "daffodil" },
    "A daffodil glowing open against the dusk.", ["daffodil", "dark", "animated"]),
];
