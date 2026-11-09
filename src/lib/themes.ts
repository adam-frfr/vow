/**
 * Theme catalogue.
 *
 * Every theme is built around real imagery: licensed photography (Unsplash
 * License, free for commercial use) or public-domain botanical plates
 * (Pierre-Joseph Redouté, "Les Roses", 1817–1824, via Wikimedia Commons).
 * No CSS-drawn decorations.
 */

import { CREDITS, MORE_THEMES } from "./themes-more";
import { MOTION_THEMES } from "./themes-motion";
import { LIBRARY_THEMES } from "./themes-library";

/** Image treatment hint (used for thumbnails and some templates). */
export type HeroLayout = "fullbleed" | "split" | "arch" | "botanical" | "polaroid" | "poster" | "card" | "cover" | "storybook";

/**
 * Templates are complete site architectures: each has its own navigation,
 * hero composition and its own design for every section. Themes pick one.
 */
export type TemplateId =
  | "classic"
  | "editorial"
  | "gallery"
  | "storybook"
  | "scrapbook"
  | "stationery"
  | "botanical"
  | "split"
  | "cinematic"
  | "grand"
  | "pop"
  | "voyage"
  | "gazette"
  | "swiss"
  | "letter"
  | "atelier"
  | "candlelit"
  | "bloom";

export const TEMPLATES: { id: TemplateId; name: string; blurb: string }[] = [
  { id: "classic", name: "Classic Formal", blurb: "Traditional invitation wording, arched portrait, mirrored timeline." },
  { id: "grand", name: "Grand Ballroom", blurb: "Full-screen photography, parallax interludes, gilded hairlines." },
  { id: "editorial", name: "Couture Editorial", blurb: "A fashion magazine: cover lines, contents page, feature story." },
  { id: "gazette", name: "The Gazette", blurb: "A vintage newspaper front page announcing your wedding." },
  { id: "gallery", name: "Museum Gallery", blurb: "Your wedding as an art exhibition, with wall labels and rooms." },
  { id: "cinematic", name: "Cinematic", blurb: "Letterboxed hero, film credits and a film-strip gallery." },
  { id: "voyage", name: "Voyage", blurb: "Postcard hero, boarding-pass details and a travel itinerary." },
  { id: "stationery", name: "Stationery Suite", blurb: "A layered invitation suite on an envelope-liner backdrop." },
  { id: "storybook", name: "Storybook", blurb: "Illustrated chapters: your love story told like a picture book." },
  { id: "scrapbook", name: "Scrapbook", blurb: "Polaroids, index cards and handwriting: playful and personal." },
  { id: "pop", name: "Pop Party", blurb: "Giant type, marquee names, color blocks and a bento gallery." },
  { id: "swiss", name: "Swiss Modern", blurb: "Strict grid, numbered sections and huge confident type." },
  { id: "split", name: "Split Screen", blurb: "A fixed photograph on one side, the story scrolling on the other." },
  { id: "botanical", name: "Botanical Heirloom", blurb: "Antique plates as specimen figures beside each section." },
  { id: "letter", name: "Love Letter", blurb: "A handwritten letter to your guests, with postscripts." },
  { id: "atelier", name: "Watercolour Atelier", blurb: "Painted florals that bloom onto paper as guests scroll, framed like a stationery suite." },
  { id: "candlelit", name: "Candlelit", blurb: "A real candle lights up as guests scroll; a dark, glowing evening invitation." },
  { id: "bloom", name: "Garden Bloom", blurb: "A real flower opens beside your story as guests scroll through the day." },
];

export type CollectionId =
  | "timeless"
  | "garden"
  | "cute"
  | "illustrated"
  | "art"
  | "rustic"
  | "modern"
  | "destination"
  | "city"
  | "cultural"
  | "bold"
  | "vintage"
  | "seasonal"
  | "watercolour"
  | "animated";

export interface Palette {
  bg: string; // page background
  surface: string; // cards / alternating sections
  text: string;
  muted: string;
  accent: string;
  onAccent: string;
}

export interface ThemeFonts {
  display: string; // names + headings
  body: string;
  script?: string; // flourish words ("and", "Save the date")
}

export interface Theme {
  id: string;
  name: string;
  collection: CollectionId;
  description: string;
  tags: string[];
  layout: HeroLayout;
  hero: string; // main image
  extras?: string[]; // secondary images (polaroids, botanical accents)
  heroFilter?: string; // e.g. grayscale for editorial looks
  overlay?: "dark" | "light"; // tint on fullbleed photos
  palette: Palette;
  fonts: ThemeFonts;
  displayCase?: "upper" | "normal";
  /** Set from TEMPLATE_ASSIGNMENTS below. */
  template?: TemplateId;
  /** For artwork-based themes: shown on museum labels and credits. */
  credit?: { title: string; artist: string; year: string };
  /** Hand-picked decor/style; anything unset falls back to palette-matched defaults. */
  decor?: import("./decor").Decor;
  style?: import("./decor").StyleAxes;
  /** Library art placed by the theme (the couple can move or remove it). */
  stickers?: import("./stickers").Sticker[];
  /** Effects the theme turns on by default. */
  effects?: import("./stickers").Effects;
}

export const COLLECTIONS: { id: CollectionId; name: string; blurb: string }[] = [
  { id: "animated", name: "Scroll Animated", blurb: "Real footage that moves as guests scroll: a candle lights, a flower opens." },
  { id: "watercolour", name: "Watercolour", blurb: "Hand-painted florals that bloom onto paper like wet ink." },
  { id: "timeless", name: "Timeless Elegance", blurb: "Black tie, ivory and gold. Polished and formal." },
  { id: "garden", name: "Romantic Garden", blurb: "Peonies, roses and meadow blooms." },
  { id: "cute", name: "Sweet & Playful", blurb: "Soft pastels, snapshots and a little whimsy." },
  { id: "illustrated", name: "2D Illustrated", blurb: "Hand-drawn and painted illustrations, storybook style." },
  { id: "art", name: "Masterpieces", blurb: "Hokusai, Klimt, Van Gogh, Monet, Mucha: public-domain art, gallery-framed." },
  { id: "rustic", name: "Rustic & Boho", blurb: "Pampas, string lights and golden fields." },
  { id: "modern", name: "Modern Minimal", blurb: "Gallery white space and confident type." },
  { id: "destination", name: "Destination", blurb: "Island light, palm shade and sea air." },
  { id: "city", name: "City & Elopement", blurb: "Paris, Tokyo, New York, Vegas and City Hall." },
  { id: "cultural", name: "World Traditions", blurb: "Mandaps, lanterns, chuppahs and fiestas." },
  { id: "bold", name: "Bold & Unexpected", blurb: "Disco balls, neon, gothic romance and fairytale castles." },
  { id: "vintage", name: "Vintage & Royal", blurb: "Heirloom botanicals, velvet tones, gilded nights." },
  { id: "seasonal", name: "Seasonal", blurb: "Autumn harvests and winter white." },
];

const U = (id: string) => `https://images.unsplash.com/${id}`;
const WM = (path: string) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}`;

/** Public-domain Redouté rose plates. */
const REDOUTE = {
  regalis: WM("3/34/Redoute_-_Rosa_gallica_regalis.jpg/960px-Redoute_-_Rosa_gallica_regalis.jpg"),
  centifolia: WM("a/a2/Redoute_-_Rosa_centifolia_foliacea.jpg/960px-Redoute_-_Rosa_centifolia_foliacea.jpg"),
  bifera: WM(
    "4/4d/Pierre-Joseph_Redout%C3%A9_-_Rosa_Bifera_Macrocarpa_-_WGA19030.jpg/960px-Pierre-Joseph_Redout%C3%A9_-_Rosa_Bifera_Macrocarpa_-_WGA19030.jpg",
  ),
  inermis: WM("2/2a/Redoute-rosa_inermis.jpg/960px-Redoute-rosa_inermis.jpg"),
};

/** Sample couple photos used in demos and as placeholders before upload. */
/** Placeholder gallery for demos: wedding details only, no strangers' faces. */
export const SAMPLE_GALLERY = [
  U("photo-1764380746366-f4d8cc52e1e3"),
  U("photo-1590683673322-0f3fabd72169"),
  U("photo-1609357871650-96ae6d79503b"),
  U("photo-1580657274234-7339717f4541"),
  U("photo-1780337092739-af81fdabf5ca"),
  U("photo-1608153917100-3bd2426fde7c"),
];

const BASE_THEMES: Theme[] = [
  // ─── Timeless Elegance ───────────────────────────────────────────
  {
    id: "ivory-gold",
    name: "Ivory & Gold",
    collection: "timeless",
    description: "Warm ivory, gilded accents and an arched portrait. The classic formal invitation.",
    tags: ["formal", "gold", "classic"],
    layout: "arch",
    hero: U("photo-1764380746366-f4d8cc52e1e3"),
    palette: { bg: "#FBF8F1", surface: "#F3EDE1", text: "#2B2620", muted: "#7A6F62", accent: "#A8834E", onAccent: "#FFFFFF" },
    fonts: { display: "Cormorant Garamond", body: "Montserrat", script: "Pinyon Script" },
  },
  {
    id: "black-tie",
    name: "Black Tie",
    collection: "timeless",
    description: "Evening glamour in black and champagne gold. For an after-dark celebration.",
    tags: ["formal", "dark", "evening"],
    layout: "fullbleed",
    hero: U("photo-1580657274234-7339717f4541"),
    overlay: "dark",
    palette: { bg: "#0F0E0D", surface: "#191715", text: "#F2ECE2", muted: "#A79E90", accent: "#C9A96E", onAccent: "#0F0E0D" },
    fonts: { display: "Bodoni Moda", body: "Jost" },
    displayCase: "upper",
  },
  {
    id: "champagne",
    name: "Champagne Toast",
    collection: "timeless",
    description: "Soft champagne tones, editorial split layout, a raised glass.",
    tags: ["elegant", "neutral", "editorial"],
    layout: "split",
    hero: U("photo-1776530899794-aaaa3b9dd1a1"),
    palette: { bg: "#F7F1E9", surface: "#EFE5D8", text: "#2F2822", muted: "#85776A", accent: "#9C7448", onAccent: "#FFFFFF" },
    fonts: { display: "Italiana", body: "Lato", script: "Great Vibes" },
  },
  {
    id: "grand-estate",
    name: "Grand Estate",
    collection: "timeless",
    description: "Stately manor, Roman capitals and a cinematic full-screen opening.",
    tags: ["formal", "estate", "cinematic"],
    layout: "fullbleed",
    hero: U("photo-1775126964671-43b4c1a1c5ce"),
    overlay: "dark",
    palette: { bg: "#F6F3EE", surface: "#ECE6DC", text: "#24221F", muted: "#77716A", accent: "#6E5B3E", onAccent: "#FFFFFF" },
    fonts: { display: "Cinzel", body: "Cormorant Garamond", script: "Pinyon Script" },
    displayCase: "upper",
  },

  // ─── Romantic Garden ─────────────────────────────────────────────
  {
    id: "blush-peony",
    name: "Blush Peony",
    collection: "garden",
    description: "Petal pink peonies framed in an arch, with a flowing script.",
    tags: ["pink", "floral", "romantic"],
    layout: "arch",
    hero: U("photo-1579664872746-55e2a805d705"),
    palette: { bg: "#FDF6F4", surface: "#F8E9E5", text: "#3B2A2A", muted: "#8E7472", accent: "#B9777A", onAccent: "#FFFFFF" },
    fonts: { display: "Playfair Display", body: "Lato", script: "Great Vibes" },
  },
  {
    id: "english-rose",
    name: "English Rose",
    collection: "garden",
    description: "Garden roses in a glass vase. Gentle, timeless and quintessentially romantic.",
    tags: ["roses", "floral", "soft"],
    layout: "fullbleed",
    hero: U("photo-1590683673322-0f3fabd72169"),
    overlay: "dark",
    palette: { bg: "#FBF7F4", surface: "#F3EAE4", text: "#352C2A", muted: "#8A7B76", accent: "#A0646A", onAccent: "#FFFFFF" },
    fonts: { display: "Libre Baskerville", body: "Lato", script: "Parisienne" },
  },
  {
    id: "wildflower",
    name: "Wildflower Meadow",
    collection: "garden",
    description: "Poppies and cornflowers under an open sky. Free-spirited and bright.",
    tags: ["wildflowers", "colorful", "outdoor"],
    layout: "fullbleed",
    hero: U("photo-1771607508623-1971c3f3bf7e"),
    overlay: "dark",
    palette: { bg: "#FBF8F2", surface: "#F2ECE0", text: "#2E2A24", muted: "#7E776B", accent: "#B4492F", onAccent: "#FFFFFF" },
    fonts: { display: "Fraunces", body: "Karla", script: "Allura" },
  },
  {
    id: "secret-garden",
    name: "Secret Garden",
    collection: "garden",
    description: "Wildflower tablescapes, sage greens and a relaxed editorial split.",
    tags: ["sage", "green", "garden party"],
    layout: "split",
    hero: U("photo-1684243920725-956d93ff391a"),
    palette: { bg: "#F4F3EC", surface: "#E8E8DC", text: "#2C3027", muted: "#737866", accent: "#5F7454", onAccent: "#FFFFFF" },
    fonts: { display: "Lora", body: "Karla", script: "Allura" },
  },

  // ─── Sweet & Playful ─────────────────────────────────────────────
  {
    id: "cherry-blossom",
    name: "Cherry Blossom Crush",
    collection: "cute",
    description: "Sakura pinks and scattered snapshots. Sweet without being silly.",
    tags: ["pink", "cute", "spring"],
    layout: "polaroid",
    hero: U("photo-1716169888141-68bfbb190e78"),
    extras: [U("photo-1555231955-348aa2312e19"), U("photo-1519741497674-611481863552")],
    palette: { bg: "#FFF5F7", surface: "#FDE7EC", text: "#4A2F38", muted: "#9C7C86", accent: "#D9718C", onAccent: "#FFFFFF" },
    fonts: { display: "Fraunces", body: "Quicksand", script: "Sacramento" },
  },
  {
    id: "sweetest-day",
    name: "Sweetest Day",
    collection: "cute",
    description: "Buttercream, sugar flowers and peachy warmth. Like a cake you want to frame.",
    tags: ["peach", "cute", "cake"],
    layout: "polaroid",
    hero: U("photo-1609357871650-96ae6d79503b"),
    extras: [U("photo-1595970730806-e3df09af8038"), U("photo-1606216794079-73f85bbd57d5")],
    palette: { bg: "#FFF8F1", surface: "#FCEBDD", text: "#4A3426", muted: "#9F8573", accent: "#DE8A6A", onAccent: "#FFFFFF" },
    fonts: { display: "Playfair Display", body: "Nunito", script: "Dancing Script" },
  },
  {
    id: "lemon-zest",
    name: "Lemon Zest",
    collection: "cute",
    description: "Sunny lemons and Mediterranean blue. Bright, happy and summery.",
    tags: ["yellow", "summer", "cheerful"],
    layout: "polaroid",
    hero: U("photo-1763066696319-d1093663bbd2"),
    extras: [U("photo-1790792529010-dfc1f37a9bfa"), U("photo-1532712938310-34cb3982ef74")],
    palette: { bg: "#FFFCEF", surface: "#FBF2CC", text: "#22344A", muted: "#6D7A8A", accent: "#2F5D8C", onAccent: "#FFFFFF" },
    fonts: { display: "Fraunces", body: "Quicksand", script: "Sacramento" },
  },
  {
    id: "daisy-days",
    name: "Daisy Days",
    collection: "cute",
    description: "Fresh daisies on powder blue. Light, airy and full of charm.",
    tags: ["blue", "daisies", "cute"],
    layout: "polaroid",
    hero: U("photo-1678069198994-e43a9ea2550f"),
    extras: [U("photo-1480511361210-b1b966c8d614"), U("photo-1606216794074-735e91aa2c92")],
    palette: { bg: "#F1F6FB", surface: "#E1ECF6", text: "#26364A", muted: "#6E7F93", accent: "#E08A4F", onAccent: "#FFFFFF" },
    fonts: { display: "DM Serif Display", body: "Quicksand", script: "Sacramento" },
  },

  // ─── Rustic & Boho ───────────────────────────────────────────────
  {
    id: "pampas",
    name: "Pampas Dreams",
    collection: "rustic",
    description: "Feathery pampas, sandy neutrals and a soft arch. Effortless boho.",
    tags: ["boho", "neutral", "pampas"],
    layout: "arch",
    hero: U("photo-1780337092739-af81fdabf5ca"),
    palette: { bg: "#F5EEE5", surface: "#EBE0D2", text: "#3A2E25", muted: "#8C7A6A", accent: "#A6714C", onAccent: "#FFFFFF" },
    fonts: { display: "Marcellus", body: "Jost", script: "Allura" },
  },
  {
    id: "string-lights",
    name: "Under the Lights",
    collection: "rustic",
    description: "Glowing string lights and timber beams. Cozy barn-party warmth.",
    tags: ["rustic", "barn", "evening"],
    layout: "fullbleed",
    hero: U("photo-1526092817387-8f07b2904e48"),
    overlay: "dark",
    palette: { bg: "#F4EFE7", surface: "#E9E0D3", text: "#30271F", muted: "#86786A", accent: "#8A603C", onAccent: "#FFFFFF" },
    fonts: { display: "Libre Baskerville", body: "Raleway", script: "Sacramento" },
  },
  {
    id: "golden-field",
    name: "Golden Field",
    collection: "rustic",
    description: "Sun-dried grasses and terracotta warmth. Golden-hour romance.",
    tags: ["terracotta", "boho", "golden hour"],
    layout: "fullbleed",
    hero: U("photo-1620960989777-2230ddd68e98"),
    overlay: "dark",
    palette: { bg: "#F8F1EA", surface: "#F0E2D5", text: "#3A2A22", muted: "#8E7768", accent: "#B5653A", onAccent: "#FFFFFF" },
    fonts: { display: "Bodoni Moda", body: "Jost", script: "Allura" },
  },
  {
    id: "vineyard",
    name: "Vineyard Walk",
    collection: "rustic",
    description: "A stroll through sunny vines. Relaxed countryside elegance.",
    tags: ["vineyard", "countryside", "airy"],
    layout: "split",
    hero: U("photo-1779475501433-69a3a0b310f8"),
    palette: { bg: "#F7F5EE", surface: "#ECE9DC", text: "#2E2C24", muted: "#7B786A", accent: "#6B6A3A", onAccent: "#FFFFFF" },
    fonts: { display: "Cormorant Garamond", body: "Karla", script: "Parisienne" },
  },

  // ─── Modern Minimal ──────────────────────────────────────────────
  {
    id: "gallery-white",
    name: "Gallery White",
    collection: "modern",
    description: "White blooms, white space, crisp type. Quietly confident.",
    tags: ["minimal", "white", "modern"],
    layout: "split",
    hero: U("photo-1608153917100-3bd2426fde7c"),
    palette: { bg: "#FFFFFF", surface: "#F5F5F3", text: "#141414", muted: "#6F6F6B", accent: "#141414", onAccent: "#FFFFFF" },
    fonts: { display: "Italiana", body: "Jost" },
    displayCase: "upper",
  },
  {
    id: "sage-minimal",
    name: "Sage Minimal",
    collection: "modern",
    description: "Eucalyptus greens and generous whitespace. Calm and contemporary.",
    tags: ["sage", "minimal", "green"],
    layout: "arch",
    hero: U("photo-1634291196724-742f2a32463c"),
    palette: { bg: "#F3F5EF", surface: "#E6EADF", text: "#26291F", muted: "#71776A", accent: "#6F8360", onAccent: "#FFFFFF" },
    fonts: { display: "Cormorant Garamond", body: "Jost" },
  },
  {
    id: "editorial-mono",
    name: "Editorial Mono",
    collection: "modern",
    description: "Black-and-white photography and magazine typography. Fashion-forward.",
    tags: ["black and white", "editorial", "modern"],
    layout: "fullbleed",
    hero: U("photo-1520854221256-17451cc331bf"),
    heroFilter: "grayscale(1) contrast(1.05)",
    overlay: "dark",
    palette: { bg: "#F4F3F1", surface: "#E9E7E3", text: "#111111", muted: "#6B6964", accent: "#111111", onAccent: "#FFFFFF" },
    fonts: { display: "DM Serif Display", body: "Inter" },
  },
  {
    id: "midnight",
    name: "Midnight Stars",
    collection: "modern",
    description: "Deep navy and the Milky Way. Written in the stars.",
    tags: ["navy", "night", "celestial"],
    layout: "fullbleed",
    hero: U("photo-1488866022504-f2584929ca5f"),
    overlay: "dark",
    palette: { bg: "#0D1526", surface: "#141E33", text: "#EDE7DA", muted: "#9AA3B5", accent: "#D9BF8C", onAccent: "#0D1526" },
    fonts: { display: "Cinzel", body: "Raleway", script: "Pinyon Script" },
    displayCase: "upper",
  },

  // ─── Destination ─────────────────────────────────────────────────
  {
    id: "santorini",
    name: "Santorini Blue",
    collection: "destination",
    description: "Whitewashed walls, cobalt domes and the Aegean beyond.",
    tags: ["greece", "blue", "island"],
    layout: "fullbleed",
    hero: U("photo-1570077188670-e3a8d69ac5ff"),
    overlay: "dark",
    palette: { bg: "#F7FAFC", surface: "#E8F0F7", text: "#16283D", muted: "#64768A", accent: "#1F5E9E", onAccent: "#FFFFFF" },
    fonts: { display: "Playfair Display", body: "Montserrat", script: "Great Vibes" },
  },
  {
    id: "tropical",
    name: "Tropical Palm",
    collection: "destination",
    description: "Lush palm fronds and deep greens. Barefoot luxury.",
    tags: ["tropical", "green", "beach"],
    layout: "split",
    hero: U("photo-1525923838299-2312b60f6d69"),
    palette: { bg: "#F4F2E9", surface: "#E6E7D8", text: "#1F2C25", muted: "#69766D", accent: "#2E6B4F", onAccent: "#FFFFFF" },
    fonts: { display: "Fraunces", body: "Jost", script: "Allura" },
  },
  {
    id: "beach-sunset",
    name: "Sunset Shore",
    collection: "destination",
    description: "Silhouettes at golden hour, coral skies and soft sand.",
    tags: ["beach", "sunset", "coral"],
    layout: "fullbleed",
    hero: U("photo-1519307212971-dd9561667ffb"),
    overlay: "dark",
    palette: { bg: "#FCF6F1", surface: "#F6E6DA", text: "#3A2925", muted: "#8F7870", accent: "#C9765A", onAccent: "#FFFFFF" },
    fonts: { display: "Cormorant Garamond", body: "Montserrat", script: "Great Vibes" },
  },
  {
    id: "bali",
    name: "Bali Terraces",
    collection: "destination",
    description: "Emerald rice terraces and earthy tones. Serene and spiritual.",
    tags: ["bali", "green", "jungle"],
    layout: "arch",
    hero: U("photo-1569400177960-d13fc8bc16aa"),
    palette: { bg: "#F3F1E8", surface: "#E5E3D2", text: "#252B1E", muted: "#6E7462", accent: "#4F6B3A", onAccent: "#FFFFFF" },
    fonts: { display: "Marcellus", body: "Lato", script: "Allura" },
  },

  // ─── Vintage & Royal ─────────────────────────────────────────────
  {
    id: "redoute",
    name: "Redouté Rose",
    collection: "vintage",
    description: "Hand-painted 1817 rose plates by Pierre-Joseph Redouté on heirloom paper.",
    tags: ["vintage", "botanical", "heirloom"],
    layout: "botanical",
    hero: REDOUTE.regalis,
    extras: [REDOUTE.centifolia],
    palette: { bg: "#F6F0E4", surface: "#EEE5D3", text: "#3A2C24", muted: "#85725F", accent: "#8E3B3F", onAccent: "#FFFFFF" },
    fonts: { display: "IM Fell English", body: "EB Garamond", script: "Pinyon Script" },
  },
  {
    id: "botanical-garden",
    name: "Botanical Archive",
    collection: "vintage",
    description: "Antique botanical engravings and sage ink. A naturalist's love letter.",
    tags: ["botanical", "vintage", "green"],
    layout: "botanical",
    hero: REDOUTE.bifera,
    extras: [REDOUTE.inermis],
    palette: { bg: "#F3F1E7", surface: "#E8E5D5", text: "#2A2E24", muted: "#737864", accent: "#55684A", onAccent: "#FFFFFF" },
    fonts: { display: "Cormorant Garamond", body: "EB Garamond", script: "Parisienne" },
  },
  {
    id: "royal-burgundy",
    name: "Royal Burgundy",
    collection: "vintage",
    description: "Velvet crimson roses and antique gold. Opulent and dramatic.",
    tags: ["burgundy", "red", "luxury"],
    layout: "fullbleed",
    hero: U("photo-1516565349308-c76fe36a115c"),
    overlay: "dark",
    palette: { bg: "#24100F", surface: "#311816", text: "#F3E6D8", muted: "#BFA593", accent: "#C9A15B", onAccent: "#24100F" },
    fonts: { display: "Cinzel", body: "Cormorant Garamond", script: "Pinyon Script" },
    displayCase: "upper",
  },
  {
    id: "gatsby",
    name: "Gatsby Night",
    collection: "vintage",
    description: "Lacquered black and gilded Art Deco detail. A roaring-twenties soirée.",
    tags: ["art deco", "gold", "glam"],
    layout: "fullbleed",
    hero: U("photo-1759646855074-7ddfafe29009"),
    overlay: "dark",
    palette: { bg: "#0E0E0E", surface: "#181716", text: "#EFE6D2", muted: "#A39B8A", accent: "#D4AF37", onAccent: "#0E0E0E" },
    fonts: { display: "Poiret One", body: "Josefin Sans" },
    displayCase: "upper",
  },
  {
    id: "mehndi",
    name: "Mehndi Gold",
    collection: "cultural",
    description: "Henna artistry, saffron and gold. For a celebration rich in tradition.",
    tags: ["henna", "gold", "cultural"],
    layout: "split",
    hero: U("photo-1621801306185-8c0ccf9c8eb8"),
    palette: { bg: "#FBF4E8", surface: "#F3E4CC", text: "#3D2316", muted: "#8F6E58", accent: "#A6461F", onAccent: "#FFFFFF" },
    fonts: { display: "Cinzel", body: "Lato", script: "Great Vibes" },
  },

  // ─── Seasonal ────────────────────────────────────────────────────
  {
    id: "autumn",
    name: "Autumn Harvest",
    collection: "seasonal",
    description: "Russet maple leaves and spiced warmth. Made for October.",
    tags: ["autumn", "fall", "rust"],
    layout: "split",
    hero: U("photo-1506193503569-d57d2a678510"),
    palette: { bg: "#F8F1E8", surface: "#EFE1CF", text: "#3A2619", muted: "#8E7360", accent: "#A0502A", onAccent: "#FFFFFF" },
    fonts: { display: "Fraunces", body: "Karla", script: "Allura" },
  },
  {
    id: "winter",
    name: "Winter Wonderland",
    collection: "seasonal",
    description: "Snow-dusted pines and icy blues. Crisp, quiet and magical.",
    tags: ["winter", "snow", "blue"],
    layout: "fullbleed",
    hero: U("photo-1612099452850-ed8efe7d58ff"),
    overlay: "dark",
    palette: { bg: "#F4F7FA", surface: "#E6EDF3", text: "#1E2A36", muted: "#6C7A88", accent: "#4E6E8E", onAccent: "#FFFFFF" },
    fonts: { display: "Cormorant Garamond", body: "Montserrat", script: "Pinyon Script" },
  },
  {
    id: "spring-garden",
    name: "Spring Centerpiece",
    collection: "seasonal",
    description: "Fresh spring blooms on the table. Light, hopeful and fragrant.",
    tags: ["spring", "pastel", "floral"],
    layout: "arch",
    hero: U("photo-1609670002360-153929958683"),
    palette: { bg: "#FAF7F2", surface: "#F1EBE1", text: "#33302A", muted: "#837C70", accent: "#A47B6B", onAccent: "#FFFFFF" },
    fonts: { display: "Playfair Display", body: "Karla", script: "Parisienne" },
  },
];

/** Which site architecture each theme uses. */
const TEMPLATE_ASSIGNMENTS: Record<TemplateId, string[]> = {
  classic: ["ivory-gold", "blush-peony", "ranunculus", "pampas", "spring-garden", "mehndi", "double-happiness", "arabian-nights"],
  grand: ["grand-estate", "wildflower", "sunflower", "string-lights", "alpine-lake", "royal-burgundy", "gatsby", "winter", "water-lilies", "marigold", "chuppah", "fairytale"],
  editorial: ["champagne", "orchid-noir", "noir", "golden-union", "paris", "nyc"],
  gazette: ["editorial-mono", "bookworms", "london", "city-hall"],
  gallery: ["great-wave", "red-fuji", "the-kiss", "tree-of-life", "the-swing", "primavera", "boating-party", "mucha-spring", "four-seasons", "plum-garden", "arashiyama", "plum-cranes", "crow-blossom", "audubon", "medusae", "moonlit-garden", "lady-shalott"],
  cinematic: ["black-tie", "midnight", "beach-sunset", "safari", "starry-night", "marrakech", "fireflies", "aurora", "gothic", "tokyo"],
  voyage: ["santorini", "bali", "tuscany", "cappadocia", "maldives", "lighthouse", "lavender", "lemon-zest", "vineyard", "venice", "ocean-deep"],
  stationery: ["marble", "anemone", "almond-blossom", "irises", "strawberry-thief", "morris-trellis", "mews"],
  storybook: ["stargazers", "sunset-hill", "love-balloon", "floating-hearts", "red-string", "forever-young", "watercolor-bloom", "gilded-wash", "blue-daisies", "seaside-cottage", "mountain-night", "silly-goose", "cat-people", "paradise-hills", "peter-rabbit", "bunny"],
  scrapbook: ["cherry-blossom", "sweetest-day", "macaron", "puppy-love", "picnic", "coffee"],
  pop: ["strawberry", "balloons", "sprinkles", "folk-florals", "fiesta", "disco", "mirrorball", "neon", "groovy", "our-song", "vegas"],
  swiss: ["gallery-white", "sage-minimal", "concrete", "white-roses", "calla", "brooklyn"],
  split: ["secret-garden", "tulip-garden", "golden-field", "autumn", "tropical", "hanbok", "olive-grove", "parasol"],
  botanical: ["redoute", "botanical-garden"],
  letter: ["english-rose", "candlelight", "tea-party", "daisy-days"],
  atelier: [],
  candlelit: [],
  bloom: [],
};

const ASSIGNED = new Map<string, TemplateId>();
for (const [tpl, ids] of Object.entries(TEMPLATE_ASSIGNMENTS) as [TemplateId, string[]][]) ids.forEach((id) => ASSIGNED.set(id, tpl));

export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);

const FALLBACK_TEMPLATE: Record<HeroLayout, TemplateId> = {
  fullbleed: "grand", split: "split", arch: "classic", botanical: "botanical", polaroid: "scrapbook",
  poster: "gallery", card: "stationery", cover: "editorial", storybook: "storybook",
};

/**
 * Early themes that did not feel like wedding invitations (animals, strangers'
 * portraits, plain nature photos). Hidden from every list, but still resolvable
 * so sites already using one keep rendering.
 */
const RETIRED = new Set([
  "grand-estate", "golden-field", "vineyard", "editorial-mono", "beach-sunset", "hanbok", "golden-union", "arabian-nights",
  "city-hall", "noir", "groovy", "boating-party", "lady-shalott", "parasol", "puppy-love", "bunny", "silly-goose",
  "cat-people", "peter-rabbit", "audubon", "medusae", "crow-blossom", "safari", "strawberry", "coffee", "sprinkles",
  "balloons", "picnic", "tea-party", "macaron", "anemone", "sunflower", "tulip-garden", "lavender", "autumn", "wildflower",
  "tropical", "olive-grove", "bali", "alpine-lake", "lighthouse", "maldives", "mountain-night", "seaside-cottage",
  "paradise-hills", "ocean-deep", "fireflies", "aurora", "bookworms", "gothic", "london", "tokyo", "gatsby",
  "floating-hearts", "forever-young", "sunset-hill", "concrete",
]);

const ALL_THEMES: Theme[] = [...MOTION_THEMES, ...BASE_THEMES, ...MORE_THEMES, ...LIBRARY_THEMES].map((t) => ({
  ...t,
  template: t.template ?? ASSIGNED.get(t.id) ?? FALLBACK_TEMPLATE[t.layout],
  credit: t.credit ?? CREDITS[t.id],
}));

export const THEMES: Theme[] = ALL_THEMES.filter((t) => !RETIRED.has(t.id));

export function templateOf(theme: Theme): TemplateId {
  return theme.template ?? FALLBACK_TEMPLATE[theme.layout];
}

export function getTheme(id: string): Theme {
  return ALL_THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function isThemeId(id: string) {
  return ALL_THEMES.some((t) => t.id === id);
}

/** Unsplash images are served through imgix; size them for the slot. */
export function img(url: string, width: number) {
  if (url.startsWith("https://images.unsplash.com/")) {
    return `${url}?auto=format&fit=crop&w=${width}&q=80`;
  }
  return url;
}

export const FONT_CHOICES = {
  display: [
    "Cormorant Garamond", "Playfair Display", "Bodoni Moda", "Cinzel", "Cinzel Decorative", "Italiana", "Libre Baskerville",
    "Fraunces", "DM Serif Display", "Marcellus", "Lora", "IM Fell English", "Poiret One", "Abril Fatface", "Gloock",
    "Shrikhand", "Righteous", "Fredoka", "Syne", "Rozha One", "Amiri", "UnifrakturMaguntia",
  ],
  body: ["Montserrat", "Jost", "Lato", "Karla", "Raleway", "Quicksand", "Nunito", "Inter", "EB Garamond", "Josefin Sans", "Cormorant Garamond"],
  script: ["Pinyon Script", "Great Vibes", "Parisienne", "Allura", "Sacramento", "Dancing Script", "Italianno", "Caveat", "Pacifico"],
};

// Exact axes each family supports on Google Fonts (an invalid request 400s the whole sheet).
const FULL = "ital,wght@0,400;0,500;0,600;1,400";
const FONT_AXES: Record<string, string> = {
  "Cormorant Garamond": FULL,
  "Playfair Display": FULL,
  "Bodoni Moda": FULL,
  Fraunces: FULL,
  Lora: FULL,
  Montserrat: FULL,
  Jost: FULL,
  Karla: FULL,
  Raleway: FULL,
  Nunito: FULL,
  "EB Garamond": FULL,
  "Josefin Sans": FULL,
  Cinzel: "wght@400;500;600",
  Quicksand: "wght@400;500;600",
  Inter: "wght@400;500;600",
  "Libre Baskerville": "ital,wght@0,400;0,700;1,400",
  Lato: "ital,wght@0,400;0,700;1,400",
  "DM Serif Display": "ital@0;1",
  "IM Fell English": "ital@0;1",
  Fredoka: "wght@400;500;600",
  Syne: "wght@400;500;600;700",
  Caveat: "wght@400;500;600",
  Amiri: "ital,wght@0,400;0,700;1,400",
  "Abril Fatface": "",
  "Space Mono": "ital,wght@0,400;0,700;1,400",
};

/** Build a Google Fonts stylesheet URL for a set of families. */
export function googleFontsHref(families: (string | undefined)[]) {
  const unique = [...new Set(families.filter(Boolean) as string[])];
  const params = unique
    .map((f) => {
      const axes = FONT_AXES[f];
      return `family=${f.replace(/ /g, "+")}${axes ? `:${axes}` : ""}`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
