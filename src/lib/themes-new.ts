/**
 * 100 themes for the three newest designs:
 *  - Fine Line (36): painted art printed as line work in white ink, gold foil or black ink.
 *  - Herbarium (32): pressed-specimen sheets on real paper textures.
 *  - Watercolour Wash (32): chapters floating on full-bleed watercolour washes.
 * All art: public/library (Pixabay Content License).
 */
import { FINISH_FILTERS, type Decor } from "./decor";
import type { Effects } from "./stickers";
import type { CollectionId, Theme } from "./themes";

type Pal = [bg: string, surface: string, text: string, muted: string, accent: string, onAccent: string];
type Fonts = [display: string, body: string, script?: string];
type Finish = "white" | "gold" | "ink";

const LIB = (id: string) => `/library/${id}.webp`;

function make(
  id: string,
  name: string,
  collection: CollectionId,
  template: "fineline" | "herbarium" | "wash",
  hero: string,
  layout: Theme["layout"],
  [bg, surface, text, muted, accent, onAccent]: Pal,
  [display, body, script]: Fonts,
  description: string,
  tags: string[],
  x: { decor?: Decor; effects?: Effects; extras?: string[]; heroFilter?: string } = {},
): Theme {
  return {
    id, name, collection, template, hero, layout, description, tags,
    palette: { bg, surface, text, muted, accent, onAccent },
    fonts: { display, body, script },
    decor: x.decor, effects: x.effects, extras: x.extras, heroFilter: x.heroFilter,
  };
}

// ─── Fine Line ─────────────────────────────────────────────────────
const fine = (id: string, name: string, c: CollectionId, frame: string, finish: Finish, pal: Pal, f: Fonts, sprig: string | undefined, rule: string | undefined, desc: string, tags: string[], fx: Effects = { reveal: "fade" }) =>
  make(id, name, c, "fineline", LIB(frame), "poster", pal, f, desc, tags, {
    decor: { heroFloral: frame, corner: sprig, divider: rule, finish, ink: true },
    effects: fx,
    heroFilter: FINISH_FILTERS[finish],
  });

const NAVY: Pal = ["#1E2638", "#262F44", "#EEF0F5", "#A9B1C4", "#C9B98F", "#1E2638"];
const MIDNIGHT: Pal = ["#141B2B", "#1C2437", "#ECEFF5", "#9CA6BB", "#D4BC86", "#141B2B"];
const SLATE: Pal = ["#5B6E8C", "#64789A", "#F4F6FA", "#D9DFEA", "#F4F6FA", "#5B6E8C"];
const FOREST: Pal = ["#1C2A23", "#24352C", "#EDF1EC", "#A8B8AD", "#CDB57E", "#1C2A23"];
const EMERALD: Pal = ["#0F3B33", "#15473E", "#EAF3F0", "#9EC0B6", "#D8BE80", "#0F3B33"];
const WINE: Pal = ["#3A1520", "#451C28", "#F5E9EB", "#C9A9B0", "#E2C08D", "#3A1520"];
const PLUM: Pal = ["#2C1C33", "#36243E", "#F1EAF4", "#B9A7C1", "#D9BF8C", "#2C1C33"];
const CHARCOAL: Pal = ["#1F1E1D", "#292826", "#F2EFEA", "#A9A49C", "#CDB283", "#1F1E1D"];
const BLACK: Pal = ["#0E0E0E", "#181818", "#F4F1EC", "#A19B92", "#D7B77A", "#0E0E0E"];
const DUSK: Pal = ["#3B3F5C", "#454A6A", "#F3F2F7", "#C3C3D6", "#E8D3A6", "#3B3F5C"];
const TERRA: Pal = ["#7A3E2B", "#864735", "#FBF1EA", "#E5C6B8", "#FBF1EA", "#7A3E2B"];
const SAGE_DARK: Pal = ["#4E5E4F", "#58695A", "#F3F5F0", "#CFD8CD", "#F3F5F0", "#4E5E4F"];
const IVORY: Pal = ["#F8F5EE", "#EFEADF", "#1F1D1A", "#77716A", "#1F1D1A", "#FFFFFF"];
const WHITE: Pal = ["#FFFFFF", "#F4F4F2", "#1B1B1B", "#77746F", "#1B1B1B", "#FFFFFF"];
const BLUSH_P: Pal = ["#F7ECE8", "#EFDCD5", "#3A2726", "#8B706B", "#3A2726", "#FFFFFF"];
const SAGE_P: Pal = ["#EEF1EA", "#E1E6DB", "#232C24", "#6D776C", "#232C24", "#FFFFFF"];
const STONE_P: Pal = ["#ECE8E1", "#E0DAD0", "#2A2622", "#7A736A", "#2A2622", "#FFFFFF"];
const SKY_P: Pal = ["#EDF2F7", "#DEE6EF", "#1D2838", "#68768A", "#1D2838", "#FFFFFF"];
const CHAMP: Pal = ["#F6F0E4", "#EDE3D0", "#2E2719", "#7F7458", "#A88544", "#FFFFFF"];

const F_SCRIPT: Fonts = ["Cormorant Garamond", "Jost", "Mrs Saint Delafield"];
const F_BODONI: Fonts = ["Bodoni Moda", "Jost", "Monsieur La Doulaise"];
const F_TENOR: Fonts = ["Tenor Sans", "EB Garamond", "Pinyon Script"];
const F_PRATA: Fonts = ["Prata", "Mulish", "Corinthia"];
const F_GILDA: Fonts = ["Gilda Display", "Work Sans", "Ephesis"];
const F_CINZEL: Fonts = ["Cinzel", "EB Garamond", "Italianno"];
const F_BELLE: Fonts = ["Bellefair", "Jost", "Birthstone"];
const F_FORUM: Fonts = ["Forum", "Lato", "Imperial Script"];
const F_ITAL: Fonts = ["Italiana", "Josefin Sans", "Allura"];
const F_LORA: Fonts = ["Lora", "Raleway", "Alex Brush"];

export const NEW_THEMES: Theme[] = [
  fine("fl-moonlight", "Moonlight Meadow", "timeless", "gold-ring-wildflowers", "white", NAVY, F_SCRIPT, "sprigs-set-2", "greenery-spray",
    "White-ink wildflowers on deep navy, like a letterpress card.", ["navy", "white ink", "letterpress"]),
  fine("fl-midnight-wisteria", "Midnight Wisteria", "timeless", "wisteria-gold-ring", "white", MIDNIGHT, F_BODONI, "sprigs-set-3", undefined,
    "Falling wisteria drawn in white on a midnight card.", ["midnight", "wisteria", "line art"], { reveal: "blur" }),
  fine("fl-big-sky", "Big Sky", "destination", "eucalyptus-wreath", "white", SLATE, F_TENOR, "sprigs-set-2", "greenery-spray",
    "A white eucalyptus wreath on slate blue. Mountain-lodge calm.", ["slate", "blue", "mountain"], { reveal: "rise", ambient: "leaves", amount: "light" }),
  fine("fl-forest-ink", "Forest Ink", "rustic", "small-garden-wreath", "white", FOREST, F_LORA, "sprigs-set-2", "greenery-spray",
    "Herb garden line work on deep forest green.", ["forest", "green", "herbs"], { reveal: "fade", ambient: "leaves", amount: "light" }),
  fine("fl-emerald-gold", "Emerald & Gold Leaf", "timeless", "gold-leaf-wreath", "gold", EMERALD, F_CINZEL, "sprigs-set-4", undefined,
    "A gold-foil leaf wreath on emerald. Black-tie in green.", ["emerald", "gold foil", "formal"]),
  fine("fl-wine-foil", "Bordeaux Foil", "timeless", "gold-ring-eucalyptus-burgundy", "gold", WINE, F_PRATA, "sprigs-set-4", undefined,
    "Gold foil roses and eucalyptus on wine-dark card.", ["burgundy", "gold foil", "romantic"], { reveal: "fade", ambient: "petals", amount: "light" }),
  fine("fl-plum-lavender", "Plum Lavender", "watercolour", "gold-ring-lavender", "gold", PLUM, F_GILDA, "sprigs-set-4", undefined,
    "Lavender in gold foil on deep plum.", ["plum", "lavender", "gold foil"]),
  fine("fl-charcoal-arch", "Charcoal Arch", "modern", "gold-arch-florals", "white", CHARCOAL, F_ITAL, "sprigs-set-3", undefined,
    "A slender white arch with a posy at its foot, on charcoal.", ["charcoal", "arch", "modern"], { reveal: "rise" }),
  fine("fl-noir-baroque", "Noir Baroque", "vintage", "gold-baroque-frame-2", "gold", BLACK, F_CINZEL, undefined, undefined,
    "An ornate gold-foil baroque frame on black.", ["black", "baroque", "gold foil"]),
  fine("fl-dusk-hearts", "Dusk Hearts", "cute", "hearts-ring", "white", DUSK, F_BELLE, undefined, undefined,
    "A ring of little white hearts on twilight blue.", ["hearts", "twilight", "sweet"], { reveal: "zoom", ambient: "hearts", amount: "light" }),
  fine("fl-terracotta-sprig", "Terracotta Sprig", "rustic", "blush-sprig-wreath", "white", TERRA, F_FORUM, "sprigs-set-2", undefined,
    "White sprigs on baked terracotta. Desert-wedding warm.", ["terracotta", "desert", "boho"], { reveal: "slide" }),
  fine("fl-sage-ring", "Sage Ring", "garden", "gold-ring-greenery-top", "white", SAGE_DARK, F_TENOR, "sprigs-set-2", "greenery-spray",
    "White greenery crowning a fine ring on sage.", ["sage", "greenery", "minimal"]),
  fine("fl-navy-rings", "Two Rings", "modern", "gold-double-ring-pink", "gold", NAVY, F_ITAL, undefined, undefined,
    "Two interlocking gold-foil rings with sprigs on navy.", ["rings", "navy", "gold"], { reveal: "zoom" }),
  fine("fl-midnight-geo", "Midnight Geometry", "modern", "geo-greenery-2", "gold", MIDNIGHT, F_BODONI, "sprigs-set-4", undefined,
    "A gold geometric frame with leaves on midnight.", ["geometric", "gold", "modern"]),
  fine("fl-forest-heart", "Woodland Heart", "rustic", "floral-heart", "white", FOREST, F_BELLE, "sprigs-set-2", undefined,
    "Tulips and leaves drawn into a white heart on forest green.", ["heart", "forest", "sweet"], { reveal: "zoom" }),
  fine("fl-wine-berries", "Winter Berries", "seasonal", "red-berry-wreath", "white", WINE, F_LORA, "sprigs-set-3", undefined,
    "A white berry wreath on deep wine for a winter wedding.", ["winter", "berries", "wine"], { reveal: "fade", ambient: "leaves", amount: "light" }),
  fine("fl-black-tie-ring", "Black Tie Ring", "timeless", "gold-ring-leaves", "gold", BLACK, F_BODONI, undefined, undefined,
    "A gold-foil ring of leaves on black. Strictly black tie.", ["black tie", "gold", "formal"]),
  fine("fl-plum-heart", "Gilded Heart Noir", "timeless", "gold-heart-blush", "gold", PLUM, F_PRATA, undefined, undefined,
    "A faceted gold-foil heart on aubergine.", ["heart", "plum", "gold"]),
  fine("fl-slate-vine", "Slate Vine", "vintage", "gold-vine-frame", "white", SLATE, F_CINZEL, undefined, undefined,
    "A Victorian vine frame printed in white on slate.", ["victorian", "vine", "slate"]),
  fine("fl-emerald-teal", "Fern Ring", "garden", "teal-botanical-ring", "white", EMERALD, F_TENOR, "sprigs-set-2", undefined,
    "White fern sprigs on a fine ring, on emerald.", ["fern", "emerald", "botanical"]),
  fine("fl-charcoal-lavender", "Lavender Ribbon Noir", "vintage", "lavender-ribbon-ring", "white", CHARCOAL, F_GILDA, undefined, undefined,
    "Lavender tied with a ribbon, in white ink on charcoal.", ["lavender", "ribbon", "charcoal"]),
  fine("fl-navy-anemone", "Anemone Arch Noir", "modern", "anemone-arch", "white", NAVY, F_ITAL, undefined, undefined,
    "A fine arch with anemones in white on navy.", ["arch", "anemone", "navy"], { reveal: "rise" }),
  // light paper, black ink & gold foil
  fine("fl-ivory-ink", "Ivory & Ink", "timeless", "gold-ring-wildflowers", "ink", IVORY, F_SCRIPT, "sprigs-set-2", "greenery-spray",
    "Black-ink wildflowers on ivory: the classic letterpress invitation.", ["ivory", "black ink", "classic"]),
  fine("fl-white-eucalyptus", "Pen & Eucalyptus", "modern", "eucalyptus-wreath", "ink", WHITE, F_TENOR, "sprigs-set-2", "greenery-spray",
    "A pen-drawn eucalyptus wreath on crisp white.", ["white", "eucalyptus", "pen"], { reveal: "rise" }),
  fine("fl-blush-ink", "Blush Pen", "watercolour", "blush-sprig-wreath", "ink", BLUSH_P, F_SCRIPT, "sprigs-set-2", undefined,
    "Black-ink sprigs on blush paper. Soft and simple.", ["blush", "ink", "simple"], { reveal: "fade", ambient: "petals", amount: "light" }),
  fine("fl-sage-ink", "Sage Sketch", "garden", "small-garden-wreath", "ink", SAGE_P, F_LORA, "sprigs-set-2", "greenery-spray",
    "A sketched herb wreath on sage paper.", ["sage", "sketch", "garden"]),
  fine("fl-stone-arch", "Stone Arch", "modern", "gold-arch-florals", "ink", STONE_P, F_ITAL, undefined, undefined,
    "An inked arch and posy on warm stone paper.", ["arch", "stone", "minimal"]),
  fine("fl-sky-wisteria", "Sky Wisteria", "watercolour", "wisteria-gold-ring", "ink", SKY_P, F_BELLE, "sprigs-set-3", undefined,
    "Inked wisteria on pale sky-blue card.", ["wisteria", "sky", "ink"], { reveal: "blur" }),
  fine("fl-champagne-foil", "Champagne Foil", "timeless", "gold-ring-greenery-light", "gold", CHAMP, F_CINZEL, "sprigs-set-4", undefined,
    "Gold-foil greenery on champagne paper.", ["champagne", "gold foil", "elegant"]),
  fine("fl-ivory-baroque", "Gilt Baroque", "vintage", "gold-baroque-frame", "gold", IVORY, F_CINZEL, undefined, undefined,
    "A gold-foil baroque frame on ivory. Palace formal.", ["baroque", "gold", "ivory"]),
  fine("fl-white-geo", "Pen Geometry", "modern", "geo-greenery-3", "ink", WHITE, F_ITAL, "sprigs-set-2", undefined,
    "Inked geometric frame with leaves, on white.", ["geometric", "ink", "modern"], { reveal: "zoom" }),
  fine("fl-blush-heart", "Little Heart", "cute", "floral-heart", "ink", BLUSH_P, F_BELLE, undefined, undefined,
    "A heart of inked tulips on blush.", ["heart", "blush", "cute"], { reveal: "zoom", ambient: "hearts", amount: "light" }),
  fine("fl-ivory-lavender", "Lavender Pen", "vintage", "lavender-ring", "ink", IVORY, F_GILDA, undefined, undefined,
    "Inked lavender sprigs around a dotted ring.", ["lavender", "ink", "vintage"]),
  fine("fl-champagne-oval", "Gold Oval", "timeless", "eucalyptus-gold-oval", "gold", CHAMP, F_PRATA, undefined, undefined,
    "A gold-foil oval cradled in eucalyptus.", ["oval", "gold", "eucalyptus"]),
  fine("fl-stone-leaves", "Gold Leaves on Stone", "modern", "gold-geo-leaves", "gold", STONE_P, F_TENOR, undefined, undefined,
    "A geometric gold frame with tall leaves, on stone.", ["geometric", "gold", "leaves"]),
  fine("fl-sky-navy", "Navy Botanical Pen", "modern", "navy-botanical-wreath", "ink", SKY_P, F_FORUM, "sprigs-set-2", undefined,
    "An inked botanical wreath on pale blue.", ["navy", "botanical", "ink"]),
];

// ─── Herbarium ─────────────────────────────────────────────────────
const herb = (id: string, name: string, c: CollectionId, paper: string, specimens: string[], pal: Pal, f: Fonts, desc: string, tags: string[], fx: Effects = { reveal: "rise" }) =>
  make(id, name, c, "herbarium", LIB(specimens[0]), "botanical", pal, f, desc, tags, {
    decor: { heroFloral: specimens[0], ink: true },
    effects: fx,
    extras: [LIB(paper), ...specimens.map(LIB)],
  });

const PAPER: Pal = ["#F3ECDD", "#EAE0CC", "#2E271C", "#7C705B", "#7D5A2C", "#FFFFFF"];
const PAPER_ROSE: Pal = ["#F4E9E4", "#EBDAD3", "#33221F", "#80675F", "#9C4A55", "#FFFFFF"];
const PAPER_SAGE: Pal = ["#EEF0E6", "#E1E5D6", "#252B20", "#6C7461", "#55704B", "#FFFFFF"];
const PAPER_BLUE: Pal = ["#ECF0F3", "#DDE4EA", "#1F2933", "#66717C", "#3E5F80", "#FFFFFF"];
const PAPER_LILAC: Pal = ["#F1EEF5", "#E5E0EC", "#2A2533", "#736C7E", "#6B5591", "#FFFFFF"];
const PAPER_PEACH: Pal = ["#F8EEE5", "#F0E0D2", "#35261C", "#86705F", "#B4613E", "#FFFFFF"];
const H_BASK: Fonts = ["Libre Baskerville", "Karla", "Mrs Saint Delafield"];
const H_FELL: Fonts = ["IM Fell English", "EB Garamond", "Pinyon Script"];
const H_CORM: Fonts = ["Cormorant SC", "Cormorant Garamond", "Rouge Script"];
const H_LORA: Fonts = ["Lora", "Karla", "Caveat"];
const H_FRAUN: Fonts = ["Fraunces", "Work Sans", "Sacramento"];
const H_PRATA: Fonts = ["Prata", "Mulish", "Corinthia"];

NEW_THEMES.push(
  herb("hb-rose-study", "Rose Study", "vintage", "cream-paper", ["vintage-pink-rose", "burgundy-rosebud", "pink-rose-clip", "sprigs-set-2"], PAPER_ROSE, H_FELL,
    "Antique rose studies pressed onto old paper, each with a museum label.", ["roses", "antique", "herbarium"]),
  herb("hb-calla", "Calla Collection", "timeless", "cream-paper", ["calla-lily", "white-lily", "sprigs-set-3", "dusty-blue-anemones"], PAPER, H_CORM,
    "Calla lilies and white blooms catalogued like a botanist's archive.", ["calla", "white", "elegant"]),
  herb("hb-wildflower", "Wildflower Survey", "garden", "cream-paper", ["wildflower-posy", "sweet-pea-spray", "lilac-sprig", "sprigs-set-2"], PAPER_SAGE, H_LORA,
    "A field survey of meadow flowers, pressed and labelled.", ["wildflowers", "meadow", "relaxed"], { reveal: "slide", ambient: "leaves", amount: "light" }),
  herb("hb-tulip", "Tulip Ledger", "seasonal", "cream-paper", ["painted-red-tulips", "red-tulip-bunch", "tulip-and-daisy", "sprigs-set-2"], PAPER_PEACH, H_BASK,
    "Spring tulips recorded plate by plate.", ["tulips", "spring", "red"]),
  herb("hb-lotus", "Lotus Archive", "cultural", "pink-blue-paper", ["lotus-bud", "vintage-lotus", "cherry-blossom-bouquet", "pink-stem-spray"], PAPER_ROSE, H_PRATA,
    "Lotus buds and blossom pressed on faded paper.", ["lotus", "pink", "serene"], { reveal: "blur", ambient: "petals", amount: "light" }),
  herb("hb-forget-me-not", "Forget-Me-Not", "garden", "cream-paper", ["forget-me-not-stem", "lily-forget-me-not", "violet-cluster", "sprigs-set-2"], PAPER_BLUE, H_LORA,
    "Little blue flowers for a love that's never forgotten.", ["blue", "forget-me-not", "sweet"]),
  herb("hb-hydrangea", "Hydrangea Folio", "garden", "pastel-wash", ["hydrangea-stem", "hydrangea-bouquet", "lilac-sprig", "sprigs-set-3"], PAPER_LILAC, H_FRAUN,
    "Hydrangea heads pressed and catalogued on lilac-washed paper.", ["hydrangea", "lilac", "garden"]),
  herb("hb-blossom", "Blossom Book", "seasonal", "pink-vignette", ["cherry-blossom-bouquet", "pink-stem-spray", "tiny-pink-posy", "pink-star-flowers"], PAPER_ROSE, H_PRATA,
    "Cherry blossom specimens on a blush-tinged page.", ["cherry blossom", "spring", "pink"], { reveal: "fade", ambient: "blossom", amount: "medium" }),
  herb("hb-protea", "Cape Botanicals", "bold", "cream-paper", ["protea-dahlia", "coral-spray", "orange-posy", "sprigs-set-4"], PAPER_PEACH, H_FRAUN,
    "Proteas and coral blooms in a bold botanical record.", ["protea", "boho", "bold"]),
  herb("hb-mums", "Golden Chrysanthemum", "seasonal", "peach-wash", ["yellow-mums", "orange-posy", "sprigs-set-4", "wildflower-posy"], PAPER_PEACH, H_BASK,
    "Golden chrysanthemums for an autumn celebration.", ["autumn", "yellow", "chrysanthemum"], { reveal: "rise", ambient: "leaves", amount: "light" }),
  herb("hb-stems", "Long Stems", "modern", "cream-paper", ["painted-stems-set-1", "painted-stems-set-2", "painted-stems-set-3", "wildflower-stems-set-3"], PAPER, H_CORM,
    "Tall painted stems, one per plate. Quiet and modern.", ["stems", "minimal", "modern"]),
  herb("hb-sprigs", "Gilded Sprigs", "timeless", "cream-paper", ["sprigs-set-4", "sprigs-set-3", "sprigs-set-2", "white-florals-spray"], PAPER, H_FELL,
    "Gold, silver and green sprigs mounted like museum pieces.", ["gold", "silver", "sprigs"]),
  herb("hb-peony", "Peony Pressings", "watercolour", "pink-vignette", ["pink-posy", "pink-rose-clip", "tiny-pink-posy", "sprigs-set-2"], PAPER_ROSE, H_BASK,
    "Pink peonies and roses pressed between pages.", ["peony", "pink", "romantic"], { reveal: "rise", ambient: "petals", amount: "light" }),
  herb("hb-violet", "Violet Index", "illustrated", "lavender-wash", ["violet-cluster", "lilac-sprig", "forget-me-not-stem", "sprigs-set-2"], PAPER_LILAC, H_LORA,
    "Folk-painted violets indexed plate by plate.", ["violet", "folk", "lilac"]),
  herb("hb-red-rose", "Red Rose Register", "bold", "cream-paper", ["red-rose-eucalyptus", "red-spray", "burgundy-rosebud", "sprigs-set-4"], PAPER_ROSE, H_CORM,
    "Red roses and eucalyptus, formally recorded.", ["red", "roses", "dramatic"]),
  herb("hb-garden-party", "Garden Party Specimens", "cute", "pastel-wash", ["pastel-posy", "round-bright-bouquet", "wrapped-bouquet-cute", "pink-star-flowers"], PAPER_PEACH, H_FRAUN,
    "Bright little bouquets labelled like a school nature project.", ["colourful", "cute", "party"], { reveal: "zoom", ambient: "tulips", amount: "light" }),
  herb("hb-vases", "Painted Vases", "illustrated", "cream-paper", ["cute-vases-set-1", "cute-vases-set-2", "cute-vases-set-3", "cute-vases-set-4"], PAPER_SAGE, H_LORA,
    "Cheerful painted vases, one for every chapter.", ["vases", "illustrated", "cheerful"], { reveal: "zoom" }),
  herb("hb-vase-blue", "Blue Vase Study", "illustrated", "pastel-wash", ["vase-bouquets-set-3", "vase-bouquets-set-1", "vase-bouquets-set-7", "vase-bouquets-set-2"], PAPER_BLUE, H_BASK,
    "Watercolour bouquets in blue vases.", ["vase", "blue", "watercolour"]),
  herb("hb-cream", "Cream & Succulent", "rustic", "cream-paper", ["dusty-cream-bouquet", "succulent-peony-bouquet", "dusty-blue-anemones", "sprigs-set-3"], PAPER, H_PRATA,
    "Cream blooms and succulents for a desert or barn wedding.", ["cream", "succulent", "rustic"]),
  herb("hb-lily", "Lily Plates", "garden", "cream-paper", ["white-lily", "lily-forget-me-not", "calla-lily", "sprigs-set-2"], PAPER_SAGE, H_FELL,
    "Lilies of every kind, pressed and named.", ["lily", "white", "garden"]),
  herb("hb-coral", "Coral Notebook", "destination", "peach-wash", ["coral-spray", "red-lily-bouquet", "orange-posy", "sprigs-set-4"], PAPER_PEACH, H_FRAUN,
    "Coral lilies for a seaside or island wedding.", ["coral", "beach", "tropical"], { reveal: "slide" }),
  herb("hb-sweetpea", "Sweet Pea Diary", "watercolour", "pink-blue-paper", ["sweet-pea-spray", "tiny-pink-posy", "lilac-sprig", "pink-stem-spray"], PAPER_LILAC, H_LORA,
    "Sweet peas pressed in a diary of the summer you fell in love.", ["sweet pea", "pastel", "romantic"], { reveal: "blur" }),
  herb("hb-anemone", "Anemone Album", "modern", "cream-paper", ["dusty-blue-anemones", "white-florals-spray", "sprigs-set-3", "calla-lily"], PAPER_BLUE, H_CORM,
    "Pale anemones on archival paper. Calm and refined.", ["anemone", "blue", "refined"]),
  herb("hb-autumn", "Autumn Herbarium", "seasonal", "peach-wash", ["red-spray", "orange-posy", "yellow-mums", "sprigs-set-4"], PAPER_PEACH, H_FELL,
    "Russet blooms and golden sprigs for a fall wedding.", ["autumn", "russet", "gold"], { reveal: "rise", ambient: "leaves", amount: "medium" }),
  herb("hb-noir", "Midnight Herbarium", "timeless", "cream-paper", ["red-lily-bouquet", "burgundy-rosebud", "violet-cluster", "sprigs-set-4"], ["#1F1C19", "#2A2622", "#F1EBE0", "#A99E8C", "#D3B47A", "#1F1C19"], H_CORM,
    "Specimen sheets glowing on a dark study wall.", ["dark", "moody", "gold"]),
  herb("hb-wine", "Cellar Collection", "bold", "cream-paper", ["red-spray", "red-rose-eucalyptus", "burgundy-rosebud", "sprigs-set-4"], ["#2E1418", "#3A1B20", "#F4E8E6", "#BFA2A3", "#E0BB86", "#2E1418"], H_BASK,
    "Wine-dark specimen sheets for an evening wedding.", ["wine", "dark", "roses"]),
  herb("hb-forest", "Forest Survey", "rustic", "cream-paper", ["sprigs-set-2", "white-florals-spray", "forget-me-not-stem", "sprigs-set-3"], ["#1D2A22", "#25352B", "#EEF2EC", "#A6B6AA", "#CDB27A", "#1D2A22"], H_LORA,
    "A woodland survey on deep green.", ["forest", "green", "woodland"], { reveal: "fade", ambient: "leaves", amount: "light" }),
  herb("hb-sky", "Sky Folio", "destination", "sky-wash", ["forget-me-not-teacup", "violet-cluster", "forget-me-not-stem", "sprigs-set-3"], PAPER_BLUE, H_FRAUN,
    "Blue blooms on a sky-washed folio.", ["blue", "sky", "airy"]),
  herb("hb-lilac", "Lilac Ledger", "watercolour", "lilac-wash", ["lilac-sprig", "hydrangea-bouquet", "violet-cluster", "sprigs-set-2"], PAPER_LILAC, H_PRATA,
    "Lilac and hydrangea on washed lilac paper.", ["lilac", "purple", "soft"], { reveal: "blur", ambient: "blossom", amount: "light" }),
  herb("hb-aqua", "Seaside Specimens", "destination", "aqua-wash", ["white-florals-spray", "dusty-blue-anemones", "calla-lily", "sprigs-set-3"], PAPER_BLUE, H_CORM,
    "White blooms pressed on sea-glass paper.", ["coastal", "aqua", "white"]),
  herb("hb-pastel", "Pastel Notebook", "cute", "pastel-cloud-wash", ["pastel-posy", "tiny-pink-posy", "pink-star-flowers", "lilac-sprig"], PAPER_LILAC, H_FRAUN,
    "Pastel posies on cloud-soft paper.", ["pastel", "sweet", "dreamy"], { reveal: "zoom", ambient: "blossom", amount: "light" }),
  herb("hb-mixed", "Cabinet of Curiosities", "vintage", "cream-paper", ["protea-bouquet", "vintage-lotus", "painted-peony-bouquet", "sprigs-set-3"], PAPER, H_FELL,
    "A Victorian cabinet of rare and beautiful blooms.", ["victorian", "curiosities", "antique"], { reveal: "fade" }),
);

// ─── Watercolour Wash ──────────────────────────────────────────────
const wash = (id: string, name: string, c: CollectionId, washes: string[], blooms: string[], pal: Pal, f: Fonts, desc: string, tags: string[], fx: Effects = { reveal: "rise" }) =>
  make(id, name, c, "wash", LIB(washes[0]), "card", pal, f, desc, tags, {
    decor: { heroFloral: blooms[0], ink: true },
    effects: fx,
    extras: [...washes.map(LIB), ...blooms.map(LIB)],
  });

const W_BLUSH: Pal = ["#FBF3F3", "#F5E5E6", "#3A2428", "#8C6E73", "#B24C6A", "#FFFFFF"];
const W_AQUA: Pal = ["#F1F8F8", "#DFF0F0", "#173436", "#5C7A7C", "#1F7F86", "#FFFFFF"];
const W_SKY: Pal = ["#F2F7FB", "#E0ECF5", "#192D40", "#5E7488", "#2F6EA5", "#FFFFFF"];
const W_LILAC: Pal = ["#F6F3FA", "#EAE4F3", "#2A2340", "#746C8A", "#6F55A8", "#FFFFFF"];
const W_PEACH: Pal = ["#FEF6F0", "#FBE7DA", "#3A261C", "#8D7365", "#CF6C45", "#FFFFFF"];
const W_SUN: Pal = ["#FFFBF0", "#FBF0D4", "#33290F", "#857852", "#C38E1F", "#FFFFFF"];
const W_MINT: Pal = ["#F3FAF6", "#E0F1E8", "#1C3328", "#5E786B", "#2E8A62", "#FFFFFF"];
const W_CREAM: Pal = ["#FAF6EE", "#F0E8D9", "#2C261D", "#7C7364", "#9C7A45", "#FFFFFF"];
const W_RED: Pal = ["#FFF6F4", "#FBE4DF", "#3A1A1A", "#8A6564", "#B32A35", "#FFFFFF"];
const W_DEEP: Pal = ["#24263A", "#2E3048", "#F1EFF7", "#AEACC2", "#E8C4D6", "#24263A"];
const WF_PLAY: Fonts = ["Playfair Display", "Montserrat", "Great Vibes"];
const WF_CORM: Fonts = ["Cormorant Garamond", "Lato", "Pinyon Script"];
const WF_DM: Fonts = ["DM Serif Display", "Quicksand", "WindSong"];
const WF_FRAUN: Fonts = ["Fraunces", "Nunito", "Sacramento"];
const WF_MARC: Fonts = ["Marcellus", "Raleway", "Parisienne"];
const WF_YES: Fonts = ["Yeseva One", "Josefin Sans", "Tangerine"];
const WF_SWEET: Fonts = ["DM Serif Display", "Nunito", "Dancing Script"];
const WF_GILDA: Fonts = ["Gilda Display", "Work Sans", "Ephesis"];

NEW_THEMES.push(
  wash("wa-blush-peony", "Blush Wash", "watercolour", ["pink-vignette", "pastel-wash", "pink-blue-paper"], ["pink-posy", "pink-rose-clip", "tiny-pink-posy"], W_BLUSH, WF_PLAY,
    "Peonies spilling over blush watercolour washes.", ["blush", "peony", "romantic"], { reveal: "rise", ambient: "petals", amount: "light" }),
  wash("wa-seaglass", "Sea Glass", "destination", ["aqua-wash", "sky-wash", "pastel-cloud-wash"], ["white-florals-spray", "dusty-blue-anemones", "calla-lily"], W_AQUA, WF_CORM,
    "Sea-glass washes and white blooms for a coastal wedding.", ["coastal", "aqua", "beach"], { reveal: "slide" }),
  wash("wa-blue-sky", "Blue Sky Day", "garden", ["sky-wash", "aqua-wash", "pastel-wash"], ["forget-me-not-teacup", "lily-forget-me-not", "forget-me-not-stem"], W_SKY, WF_FRAUN,
    "Forget-me-nots under a painted summer sky.", ["blue", "sky", "summer"], { reveal: "rise", ambient: "blossom", amount: "light" }),
  wash("wa-lilac-dream", "Lilac Dream", "watercolour", ["lilac-wash", "lavender-wash", "pastel-cloud-wash"], ["violet-cluster", "lilac-sprig", "hydrangea-bouquet"], W_LILAC, WF_MARC,
    "Lilac and lavender washes with painted violets.", ["lilac", "lavender", "dreamy"], { reveal: "blur" }),
  wash("wa-peach-sunset", "Peach Sunset", "destination", ["peach-wash", "pastel-wash", "pink-vignette"], ["orange-posy", "coral-spray", "pastel-posy"], W_PEACH, WF_DM,
    "Sunset-peach washes and coral blooms.", ["peach", "sunset", "warm"], { reveal: "rise", ambient: "petals", amount: "light" }),
  wash("wa-sunshine", "Sunshine Wash", "cute", ["peach-wash", "pastel-cloud-wash", "pastel-wash"], ["round-bright-bouquet", "pastel-posy", "pink-star-flowers"], W_SUN, WF_SWEET,
    "Bright bouquets on warm sunny washes.", ["sunny", "bright", "cheerful"], { reveal: "zoom", ambient: "tulips", amount: "light" }),
  wash("wa-mint", "Mint Garden", "garden", ["aqua-wash", "pastel-cloud-wash", "sky-wash"], ["wildflower-posy", "sweet-pea-spray", "white-florals-spray"], W_MINT, WF_FRAUN,
    "Fresh mint washes and wildflowers.", ["mint", "fresh", "garden"], { reveal: "slide", ambient: "leaves", amount: "light" }),
  wash("wa-cream-paper", "Cream Paper", "timeless", ["cream-paper", "pastel-wash", "peach-wash"], ["dusty-cream-bouquet", "white-florals-spray", "calla-lily"], W_CREAM, WF_GILDA,
    "Ivory blooms on handmade cream paper.", ["cream", "ivory", "classic"], { reveal: "fade" }),
  wash("wa-red-tulip", "Tulip Wash", "seasonal", ["pink-vignette", "peach-wash", "pastel-wash"], ["painted-red-tulips", "red-tulip-bunch", "tulip-and-daisy"], W_RED, WF_YES,
    "Red tulips bursting over warm washes.", ["tulips", "red", "spring"], { reveal: "rise" }),
  wash("wa-cherry", "Cherry Wash", "seasonal", ["pink-vignette", "pink-blue-paper", "pastel-cloud-wash"], ["cherry-blossom-bouquet", "pink-stem-spray", "tiny-pink-posy"], W_BLUSH, WF_CORM,
    "Cherry blossom drifting across pink washes.", ["cherry blossom", "spring", "pink"], { reveal: "fade", ambient: "blossom", amount: "medium" }),
  wash("wa-bouquet", "Florist's Wash", "cute", ["pastel-cloud-wash", "pink-vignette", "peach-wash"], ["wrapped-bouquet-cute", "round-bright-bouquet", "tulip-rose-bouquet-cute"], W_BLUSH, WF_SWEET,
    "Wrapped bouquets tied with bows over pastel washes.", ["bouquet", "bow", "cute"], { reveal: "zoom", ambient: "hearts", amount: "light" }),
  wash("wa-hydrangea", "Hydrangea Wash", "garden", ["lavender-wash", "sky-wash", "lilac-wash"], ["hydrangea-bouquet", "violet-cluster", "lilac-sprig"], W_LILAC, WF_PLAY,
    "Hydrangeas on blue-violet washes.", ["hydrangea", "violet", "garden"], { reveal: "rise" }),
  wash("wa-lily", "Lily Pond", "watercolour", ["aqua-wash", "pastel-cloud-wash", "sky-wash"], ["lotus-bud", "lily-forget-me-not", "white-florals-spray"], W_AQUA, WF_GILDA,
    "Lotus and lily over pond-blue washes.", ["lotus", "lily", "pond"], { reveal: "blur", ambient: "petals", amount: "light" }),
  wash("wa-wine", "Wine & Wash", "bold", ["pink-vignette", "lilac-wash", "cream-paper"], ["burgundy-rosebud", "red-spray", "red-lily-bouquet"], W_RED, WF_YES,
    "Deep red blooms over soft washes. Dramatic and romantic.", ["wine", "red", "dramatic"], { reveal: "rise" }),
  wash("wa-vases", "Painted Vases", "illustrated", ["pastel-cloud-wash", "aqua-wash", "peach-wash"], ["cute-vases-set-1", "cute-vases-set-2", "cute-vases-set-4"], W_MINT, WF_SWEET,
    "Cheerful painted vases on watercolour washes.", ["vases", "illustrated", "cute"], { reveal: "zoom" }),
  wash("wa-teacup", "Teacup Wash", "cute", ["sky-wash", "pastel-wash", "pink-blue-paper"], ["forget-me-not-teacup", "pastel-posy", "tiny-pink-posy"], W_SKY, WF_SWEET,
    "A tea-party palette of washes and teacup posies.", ["teacup", "tea party", "pastel"], { reveal: "zoom", ambient: "blossom", amount: "light" }),
  wash("wa-anemone", "Anemone Wash", "modern", ["pastel-wash", "sky-wash", "cream-paper"], ["dusty-blue-anemones", "calla-lily", "white-florals-spray"], W_CREAM, WF_CORM,
    "Pale anemones floating on quiet washes.", ["anemone", "minimal", "calm"], { reveal: "fade" }),
  wash("wa-coral", "Coral Reef", "destination", ["aqua-wash", "peach-wash", "sky-wash"], ["coral-spray", "orange-posy", "red-lily-bouquet"], W_PEACH, WF_DM,
    "Coral blooms over turquoise washes for an island wedding.", ["coral", "island", "tropical"], { reveal: "slide" }),
  wash("wa-violet", "Violet Hour", "watercolour", ["lavender-wash", "lilac-wash", "pastel-cloud-wash"], ["violet-cluster", "hydrangea-bouquet", "lilac-sprig"], W_LILAC, WF_GILDA,
    "Violets at the blue hour.", ["violet", "evening", "purple"], { reveal: "blur" }),
  wash("wa-wildflower", "Wildflower Wash", "garden", ["pastel-cloud-wash", "peach-wash", "aqua-wash"], ["wildflower-posy", "sweet-pea-spray", "pastel-posy"], W_MINT, WF_FRAUN,
    "Meadow flowers over every colour of wash.", ["wildflowers", "colourful", "meadow"], { reveal: "rise", ambient: "petals", amount: "light" }),
  wash("wa-golden", "Golden Hour Wash", "seasonal", ["peach-wash", "cream-paper", "pastel-wash"], ["yellow-mums", "orange-posy", "sprigs-set-4"], W_SUN, WF_MARC,
    "Golden blooms on late-afternoon washes.", ["golden", "autumn", "warm"], { reveal: "rise", ambient: "leaves", amount: "light" }),
  wash("wa-pink-star", "Pink Stars", "cute", ["pink-vignette", "pastel-cloud-wash", "pink-blue-paper"], ["pink-star-flowers", "tiny-pink-posy", "pink-posy"], W_BLUSH, WF_SWEET,
    "Bright pink star flowers on pink washes.", ["pink", "fun", "bright"], { reveal: "zoom", ambient: "blossom", amount: "medium" }),
  wash("wa-calla", "Calla Wash", "timeless", ["cream-paper", "pastel-wash", "sky-wash"], ["calla-lily", "white-florals-spray", "dusty-cream-bouquet"], W_CREAM, WF_PLAY,
    "Calla lilies on cream and sky washes. Effortlessly elegant.", ["calla", "white", "elegant"], { reveal: "fade" }),
  wash("wa-rose", "English Rose Wash", "garden", ["pink-vignette", "pastel-wash", "cream-paper"], ["pink-rose-clip", "vintage-pink-rose", "pink-posy"], W_BLUSH, WF_CORM,
    "Garden roses over blush and cream.", ["roses", "english", "pink"], { reveal: "rise", ambient: "petals", amount: "light" }),
  wash("wa-twilight", "Twilight Wash", "watercolour", ["lavender-wash", "lilac-wash", "sky-wash"], ["violet-cluster", "lotus-bud", "hydrangea-bouquet"], W_DEEP, WF_GILDA,
    "Dusky washes for an evening ceremony.", ["twilight", "evening", "dark"], { reveal: "blur" }),
  wash("wa-dusk-rose", "Dusk Rose", "bold", ["pink-vignette", "lavender-wash", "lilac-wash"], ["burgundy-rosebud", "pink-rose-clip", "red-spray"], W_DEEP, WF_YES,
    "Roses glowing over dusk-coloured washes.", ["dusk", "roses", "moody"], { reveal: "rise" }),
  wash("wa-meadow-tulip", "Tulip Meadow", "seasonal", ["pastel-cloud-wash", "aqua-wash", "peach-wash"], ["tulip-and-daisy", "painted-red-tulips", "wildflower-posy"], W_MINT, WF_FRAUN,
    "Tulips and daisies over spring washes.", ["tulips", "daisies", "spring"], { reveal: "slide", ambient: "tulips", amount: "light" }),
  wash("wa-lotus", "Lotus Wash", "cultural", ["pink-vignette", "peach-wash", "pastel-cloud-wash"], ["lotus-bud", "cherry-blossom-bouquet", "pink-stem-spray"], W_PEACH, WF_DM,
    "Lotus buds on rose and saffron washes.", ["lotus", "saffron", "serene"], { reveal: "fade", ambient: "petals", amount: "light" }),
  wash("wa-delft", "Blue & White Wash", "cultural", ["sky-wash", "aqua-wash", "pastel-wash"], ["forget-me-not-teacup", "white-florals-spray", "violet-cluster"], W_SKY, WF_GILDA,
    "Porcelain-blue washes and white florals.", ["blue", "white", "porcelain"], { reveal: "rise" }),
  wash("wa-succulent", "Desert Bloom", "rustic", ["peach-wash", "cream-paper", "pastel-wash"], ["succulent-peony-bouquet", "dusty-cream-bouquet", "protea-dahlia"], W_PEACH, WF_MARC,
    "Succulents and proteas on desert washes.", ["desert", "succulent", "boho"], { reveal: "rise" }),
  wash("wa-pastel-party", "Pastel Party", "cute", ["pastel-cloud-wash", "pink-blue-paper", "pastel-wash"], ["pastel-posy", "round-bright-bouquet", "cute-vases-set-3"], W_LILAC, WF_SWEET,
    "Every pastel at once. A party of a page.", ["pastel", "party", "colourful"], { reveal: "zoom", ambient: "tulips", amount: "medium" }),
  wash("wa-minimal", "Quiet Wash", "modern", ["pastel-wash", "cream-paper", "sky-wash"], ["sprigs-set-3", "white-florals-spray", "sprigs-set-2"], W_CREAM, WF_CORM,
    "The softest washes and a few silver sprigs. Minimal and calm.", ["minimal", "silver", "calm"], { reveal: "fade" }),
);
