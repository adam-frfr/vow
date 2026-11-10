/**
 * Themes for the 47 "more" designs: two each (94), one lighter and one deeper,
 * each with its own palette, type and painted art. All art: public/library
 * (Pixabay Content License).
 */
import { FINISH_FILTERS, type Decor } from "./decor";
import type { Effects } from "./stickers";
import type { MoreTemplateId } from "./templates-more";
import type { CollectionId, Theme } from "./themes";

type Pal = [bg: string, surface: string, text: string, muted: string, accent: string, onAccent: string];
type Fonts = [display: string, body: string, script?: string];

const P = {
  ivory: ["#FAF7F0", "#F1EBDF", "#25221D", "#7A7368", "#9A7B4F", "#FFFFFF"],
  cream: ["#F7F1E5", "#EEE4D1", "#2E2619", "#80745F", "#B5543A", "#FFFFFF"],
  manila: ["#EFE4C8", "#E6D8B5", "#221E16", "#6F654F", "#B0342A", "#FFFFFF"],
  kraft: ["#D9C3A1", "#E7D6BB", "#2D2418", "#6A5944", "#7E2F2A", "#FFFFFF"],
  butter: ["#FBF3D9", "#F4E8C2", "#2B2516", "#7C6F4D", "#C6463A", "#FFFFFF"],
  blush: ["#F8ECE9", "#F0DEDA", "#3A2627", "#8D6F6C", "#B4566A", "#FFFFFF"],
  rose: ["#F6E6E6", "#EDD3D3", "#3B1F25", "#8B6268", "#9E2F4A", "#FFFFFF"],
  peach: ["#FBEDE3", "#F5DECD", "#3A2A20", "#8C7262", "#D0704F", "#FFFFFF"],
  sorbet: ["#FFF1EC", "#FFE1D6", "#3B1E1A", "#8E6259", "#F0567A", "#FFFFFF"],
  lilac: ["#F2EEF7", "#E6DFEF", "#2C2638", "#746B84", "#7C5BA6", "#FFFFFF"],
  sage: ["#EEF1EA", "#E1E7DA", "#232C24", "#6C786B", "#5E7A5D", "#FFFFFF"],
  olive: ["#F1EFE3", "#E4E0CB", "#2A2A1C", "#73715A", "#6B6A2C", "#FFFFFF"],
  sky: ["#EEF3F8", "#DEE7F1", "#1D2A3A", "#66768B", "#3D6EA8", "#FFFFFF"],
  sea: ["#ECF4F3", "#D9EAE8", "#173232", "#5D7978", "#2F7F7A", "#FFFFFF"],
  stone: ["#ECE8E1", "#E0DAD0", "#2A2622", "#7A736A", "#2A2622", "#FFFFFF"],
  paper: ["#FFFFFF", "#F5F4F1", "#161616", "#7A7772", "#161616", "#FFFFFF"],
  red: ["#FBF4EE", "#F3E5DA", "#1C1A18", "#706A63", "#D23A2A", "#FFFFFF"],
  cobalt: ["#F4F6FB", "#E4E9F5", "#101A33", "#5D6781", "#2747C9", "#FFFFFF"],
  navy: ["#1E2638", "#262F44", "#EEF0F5", "#A9B1C4", "#C9B98F", "#1E2638"],
  midnight: ["#141B2B", "#1C2437", "#ECEFF5", "#9CA6BB", "#D4BC86", "#141B2B"],
  forest: ["#1C2A23", "#24352C", "#EDF1EC", "#A8B8AD", "#CDB57E", "#1C2A23"],
  emerald: ["#0F3B33", "#15473E", "#EAF3F0", "#9EC0B6", "#D8BE80", "#0F3B33"],
  wine: ["#3A1520", "#451C28", "#F5E9EB", "#C9A9B0", "#E2C08D", "#3A1520"],
  plum: ["#2C1C33", "#36243E", "#F1EAF4", "#B9A7C1", "#D9BF8C", "#2C1C33"],
  black: ["#0E0E0E", "#181818", "#F4F1EC", "#A19B92", "#D7B77A", "#0E0E0E"],
  charcoal: ["#1F1E1D", "#292826", "#F2EFEA", "#A9A49C", "#CDB283", "#1F1E1D"],
  terracotta: ["#7A3E2B", "#864735", "#FBF1EA", "#E5C6B8", "#F3D7B0", "#7A3E2B"],
  dusk: ["#3B3F5C", "#454A6A", "#F3F2F7", "#C3C3D6", "#E8D3A6", "#3B3F5C"],
  indigo: ["#1F2A44", "#283553", "#EEF1F7", "#A6B0C6", "#E05A47", "#FFFFFF"],
  slate: ["#5B6E8C", "#64789A", "#F4F6FA", "#D9DFEA", "#F4F6FA", "#5B6E8C"],
} satisfies Record<string, Pal>;

const F = {
  playfair: ["Playfair Display", "Lora", "Pinyon Script"],
  cormorant: ["Cormorant Garamond", "Jost", "Great Vibes"],
  bodoni: ["Bodoni Moda", "Jost", "Monsieur La Doulaise"],
  cinzel: ["Cinzel", "EB Garamond", "Italianno"],
  fell: ["IM Fell English", "EB Garamond", "Pinyon Script"],
  typewriter: ["Special Elite", "Courier Prime", "Homemade Apple"],
  deco: ["Poiret One", "Josefin Sans", "Great Vibes"],
  limelight: ["Limelight", "Josefin Sans", "Parisienne"],
  marcellus: ["Marcellus", "Mulish", "Allura"],
  dmserif: ["DM Serif Display", "DM Sans", "Alex Brush"],
  fraunces: ["Fraunces", "Work Sans", "Mrs Saint Delafield"],
  abril: ["Abril Fatface", "Karla", "Pacifico"],
  bebas: ["Bebas Neue", "Inter", "Caveat"],
  anton: ["Anton", "Work Sans", "Caveat"],
  grotesk: ["Space Grotesk", "Space Grotesk", "Caveat"],
  mincho: ["Shippori Mincho", "Zen Kaku Gothic New", "Yuji Syuku"],
  hand: ["Caveat", "Nunito", "Nothing You Could Do"],
  italiana: ["Italiana", "Josefin Sans", "Birthstone"],
  prata: ["Prata", "Mulish", "Corinthia"],
  gilda: ["Gilda Display", "Work Sans", "Ephesis"],
  yeseva: ["Yeseva One", "Raleway", "Dancing Script"],
  tenor: ["Tenor Sans", "EB Garamond", "Pinyon Script"],
  lora: ["Lora", "Raleway", "Alex Brush"],
  rozha: ["Rozha One", "Mulish", "Rouge Script"],
} satisfies Record<string, Fonts>;

type PK = keyof typeof P;
type FK = keyof typeof F;
type Finish = "white" | "gold" | "ink";

interface Row {
  d: MoreTemplateId;
  id: string;
  name: string;
  c: CollectionId;
  art: string;
  p: PK;
  f: FK;
  desc: string;
  tags: string[];
  finish?: Finish;
  fx?: Effects;
  extras?: string[];
}

const LIB = (id: string) => `/library/${id}.webp`;

const ROWS: Row[] = [
  { d: "menu", id: "trattoria", name: "Trattoria", c: "rustic", art: "orange-posy", p: "cream", f: "playfair", desc: "A long Italian supper menu: every part of the day served as a course.", tags: ["menu", "dinner", "warm"] },
  { d: "menu", id: "supper-club", name: "Supper Club", c: "timeless", art: "burgundy-rosebud", p: "forest", f: "cinzel", desc: "A candlelit supper-club menu on deep green with gilt details.", tags: ["menu", "green", "formal"] },
  { d: "programme", id: "chapel", name: "Chapel Programme", c: "timeless", art: "eucalyptus-wreath", p: "ivory", f: "cormorant", desc: "An order-of-service booklet for a church or chapel wedding.", tags: ["programme", "classic", "ceremony"] },
  { d: "programme", id: "evensong", name: "Evensong", c: "timeless", art: "gold-ring-leaves", p: "midnight", f: "tenor", finish: "gold", desc: "A midnight-blue programme with a gold-foil wreath.", tags: ["programme", "navy", "gold foil"] },
  { d: "recipe", id: "grandmas-kitchen", name: "Grandma's Kitchen", c: "cute", art: "tulip-and-daisy", p: "butter", f: "hand", desc: "A recipe for a happy marriage, written on grandma's index cards.", tags: ["recipe", "cute", "family"] },
  { d: "recipe", id: "herb-garden", name: "Herb Garden", c: "garden", art: "lilac-sprig", p: "sage", f: "lora", desc: "Kitchen-garden recipe cards in sage with painted sprigs.", tags: ["recipe", "sage", "garden"] },
  { d: "telegram", id: "urgent-wire", name: "Urgent Wire", c: "vintage", art: "red-spray", p: "manila", f: "typewriter", desc: "Good news wired in capitals on manila paper. STOP.", tags: ["telegram", "typewriter", "vintage"] },
  { d: "telegram", id: "night-wire", name: "Night Wire", c: "vintage", art: "sprigs-set-3", p: "slate", f: "typewriter", finish: "white", desc: "A night telegram on slate blue in white ink.", tags: ["telegram", "blue", "typewriter"] },
  { d: "ticket", id: "matinee", name: "Matinee", c: "bold", art: "red-lily-bouquet", p: "red", f: "abril", desc: "A cream-and-red ticket to the best show in town.", tags: ["ticket", "red", "fun"] },
  { d: "ticket", id: "premiere", name: "Premiere", c: "bold", art: "gold-ring-rose-crown", p: "black", f: "bodoni", finish: "gold", desc: "A black-and-gold premiere ticket for an evening wedding.", tags: ["ticket", "black tie", "gold"] },
  { d: "winelabel", id: "bordeaux", name: "Bordeaux Estate", c: "rustic", art: "dense-floral-wreath", p: "wine", f: "cinzel", desc: "Your names on a Bordeaux label: vintage, appellation and all.", tags: ["wine", "vineyard", "burgundy"] },
  { d: "winelabel", id: "rose-vintage", name: "Rosé Vintage", c: "destination", art: "pink-peony-wreath", p: "blush", f: "prata", desc: "A rosé label in blush and peony, for a vineyard summer.", tags: ["wine", "rosé", "vineyard"] },
  { d: "stack", id: "confetti-deck", name: "Confetti Deck", c: "cute", art: "confetti-floral-wreath", p: "sorbet", f: "yeseva", desc: "Bright cards dealt onto a pile, in sorbet pink.", tags: ["cards", "bright", "playful"], fx: { reveal: "rise" } },
  { d: "stack", id: "sage-deck", name: "Sage Deck", c: "garden", art: "greenery-gold-ring", p: "sage", f: "marcellus", desc: "Soft sage cards stacking with greenery tucked in.", tags: ["cards", "sage", "greenery"] },
  { d: "slides", id: "keynote-ivory", name: "Keynote Ivory", c: "modern", art: "white-lily", p: "ivory", f: "italiana", desc: "Full-screen slides with a single painted lily.", tags: ["slides", "ivory", "minimal"] },
  { d: "slides", id: "noir-slides", name: "Noir Slides", c: "modern", art: "gold-ring-wildflowers", p: "black", f: "bodoni", finish: "white", desc: "Black slides with a wildflower ring drawn in white.", tags: ["slides", "black", "line art"] },
  { d: "timeline", id: "lavender-line", name: "Lavender Line", c: "watercolour", art: "lavender-ribbon-ring", p: "lilac", f: "cormorant", desc: "A fine line of lavender stops, from wreath to vows.", tags: ["timeline", "lavender", "soft"] },
  { d: "timeline", id: "ink-line", name: "Ink Line", c: "modern", art: "small-garden-wreath", p: "paper", f: "tenor", finish: "ink", desc: "A pen-and-ink timeline on crisp white.", tags: ["timeline", "ink", "minimal"] },
  { d: "index", id: "library-index", name: "Library Index", c: "vintage", art: "yellow-rose-wreath", p: "emerald", f: "fell", desc: "A bound-library index in emerald and old gold.", tags: ["index", "emerald", "bookish"] },
  { d: "index", id: "peony-index", name: "Peony Index", c: "garden", art: "round-pink-bouquet", p: "rose", f: "playfair", desc: "A side column of pink peonies beside the scrolling page.", tags: ["index", "peony", "pink"] },
  { d: "bento", id: "sorbet-bento", name: "Sorbet Bento", c: "bold", art: "round-bright-bouquet", p: "sorbet", f: "dmserif", desc: "A grid of rounded tiles in sorbet pink and coral.", tags: ["bento", "bright", "modern"] },
  { d: "bento", id: "olive-bento", name: "Olive Bento", c: "modern", art: "white-florals-spray", p: "olive", f: "fraunces", desc: "Olive-green tiles with white wildflowers.", tags: ["bento", "olive", "modern"] },
  { d: "marquee", id: "broadway", name: "Broadway", c: "bold", art: "gold-ring-roses-lilies", p: "black", f: "limelight", finish: "gold", desc: "Giant names and gold ticker tapes. A Broadway opening night.", tags: ["marquee", "black", "gold"] },
  { d: "marquee", id: "poppy", name: "Poppy Marquee", c: "bold", art: "painted-red-tulips", p: "red", f: "anton", desc: "Poster-red ticker tapes and huge type on cream.", tags: ["marquee", "red", "poster"] },
  { d: "booth", id: "flash", name: "Flash!", c: "cute", art: "wrapped-bouquet-cute", p: "sorbet", f: "abril", desc: "A photo-booth strip and hot-pink fun.", tags: ["photo booth", "pink", "fun"] },
  { d: "booth", id: "retro-booth", name: "Retro Booth", c: "vintage", art: "yellow-rose-ring", p: "butter", f: "dmserif", desc: "A seventies photo booth in butter yellow.", tags: ["photo booth", "retro", "yellow"] },
  { d: "lookbook", id: "atelier-look", name: "Atelier Lookbook", c: "modern", art: "dusty-cream-bouquet", p: "stone", f: "bodoni", desc: "A fashion lookbook in warm stone with a cream bouquet.", tags: ["lookbook", "fashion", "stone"] },
  { d: "lookbook", id: "noir-look", name: "Noir Lookbook", c: "modern", art: "burgundy-rosebud", p: "charcoal", f: "italiana", desc: "Charcoal pages, big photographs, tiny captions.", tags: ["lookbook", "charcoal", "editorial"] },
  { d: "diptych", id: "linen", name: "Linen Diptych", c: "timeless", art: "white-florals-spray", p: "stone", f: "cormorant", desc: "Paired panels on linen: a photo beside every story.", tags: ["diptych", "linen", "photo"] },
  { d: "diptych", id: "dusk", name: "Dusk Diptych", c: "timeless", art: "dusty-blue-anemones", p: "dusk", f: "gilda", desc: "Twilight-blue panels beside your photographs.", tags: ["diptych", "twilight", "photo"] },
  { d: "cover", id: "golden-hour", name: "Golden Hour", c: "destination", art: "orange-posy", p: "peach", f: "playfair", desc: "One photograph glowing behind the page as sections slide over it.", tags: ["photo", "warm", "golden"] },
  { d: "cover", id: "moonlit", name: "Moonlit Cover", c: "timeless", art: "white-florals-spray", p: "midnight", f: "cormorant", desc: "Midnight sheets sliding over your photograph.", tags: ["photo", "night", "elegant"] },
  { d: "panes", id: "conservatory", name: "Conservatory", c: "garden", art: "greenery-square-2", p: "sage", f: "marcellus", desc: "Your photo seen through conservatory glass.", tags: ["window", "green", "photo"] },
  { d: "panes", id: "blue-shutters", name: "Blue Shutters", c: "destination", art: "forget-me-not-stem", p: "sky", f: "prata", desc: "Mediterranean blue window panes.", tags: ["window", "blue", "coastal"] },
  { d: "collage", id: "moodboard", name: "Moodboard", c: "modern", art: "pastel-posy", p: "stone", f: "fraunces", desc: "Photographs, paper and painted flowers layered like a mood board.", tags: ["collage", "moodboard", "photo"] },
  { d: "collage", id: "garden-collage", name: "Garden Party Collage", c: "garden", art: "round-pink-bouquet", p: "blush", f: "yeseva", desc: "A garden party in overlapping photos and peonies.", tags: ["collage", "pink", "garden"] },
  { d: "passport", id: "navy-passport", name: "Navy Passport", c: "destination", art: "gold-leaf-wreath", p: "navy", f: "tenor", finish: "gold", desc: "A navy passport to forever with stamped visa pages.", tags: ["passport", "travel", "navy"] },
  { d: "passport", id: "burgundy-passport", name: "Burgundy Passport", c: "destination", art: "gold-ring-leaves", p: "rose", f: "cinzel", desc: "A burgundy passport for a destination wedding.", tags: ["passport", "travel", "burgundy"] },
  { d: "calendar", id: "spring-calendar", name: "Spring Calendar", c: "seasonal", art: "cherry-blossom-bouquet", p: "blush", f: "dmserif", desc: "A spring wall calendar with your day circled.", tags: ["calendar", "spring", "blossom"] },
  { d: "calendar", id: "autumn-calendar", name: "Autumn Calendar", c: "seasonal", art: "protea-dahlia", p: "cream", f: "fraunces", finish: undefined, desc: "An autumn calendar page in rust and cream.", tags: ["calendar", "autumn", "rust"] },
  { d: "vinyl", id: "jazz-night", name: "Jazz Night", c: "bold", art: "gold-ring-violet-bouquet", p: "plum", f: "limelight", finish: "gold", desc: "A jazz record sleeve in plum and gold.", tags: ["vinyl", "music", "jazz"] },
  { d: "vinyl", id: "folk-record", name: "Folk Record", c: "rustic", art: "wildflower-posy", p: "cream", f: "fell", desc: "A folk LP with wildflowers on the sleeve.", tags: ["vinyl", "music", "folk"] },
  { d: "spread", id: "fairytale-spread", name: "Fairytale", c: "illustrated", art: "pastel-flower-wreath", p: "lilac", f: "yeseva", desc: "A storybook bound in lilac cloth, a spread for every chapter.", tags: ["storybook", "fairytale", "lilac"] },
  { d: "spread", id: "clothbound", name: "Clothbound Classic", c: "vintage", art: "gold-ring-garden", p: "forest", f: "fell", desc: "A clothbound classic in bottle green.", tags: ["storybook", "book", "green"] },
  { d: "stamps", id: "airmail", name: "Airmail", c: "destination", art: "forget-me-not-teacup", p: "sky", f: "playfair", desc: "Airmail blue, a postage stamp and a postmark.", tags: ["stamp", "airmail", "blue"] },
  { d: "stamps", id: "garden-post", name: "Garden Post", c: "garden", art: "pink-posy", p: "sage", f: "lora", desc: "Botanical postage stamps on sage letters.", tags: ["stamp", "garden", "sage"] },
  { d: "tags", id: "kraft-tags", name: "Kraft Tags", c: "rustic", art: "sprigs-set-4", p: "kraft", f: "hand", desc: "Kraft-paper gift tags tied with twine.", tags: ["tags", "kraft", "rustic"] },
  { d: "tags", id: "blush-tags", name: "Blush Tags", c: "cute", art: "tiny-pink-posy", p: "blush", f: "yeseva", desc: "Blush gift tags with tiny pink posies.", tags: ["tags", "blush", "sweet"] },
  { d: "illuminated", id: "rose-manuscript", name: "Rose Manuscript", c: "vintage", art: "vintage-pink-rose", p: "cream", f: "fell", desc: "A manuscript page with a gilded capital and roses in the margin.", tags: ["manuscript", "medieval", "rose"] },
  { d: "illuminated", id: "azure-manuscript", name: "Azure Manuscript", c: "vintage", art: "violet-cluster", p: "sky", f: "cinzel", desc: "Lapis-blue capitals and violets in the margins.", tags: ["manuscript", "blue", "medieval"] },
  { d: "deco", id: "gilded-age", name: "Gilded Age", c: "vintage", art: "gold-geo-leaves", p: "black", f: "deco", desc: "Chamfered gilt frames and a sunburst fan on black.", tags: ["art deco", "gold", "1920s"] },
  { d: "deco", id: "emerald-deco", name: "Emerald Deco", c: "vintage", art: "gold-geo-berries", p: "emerald", f: "limelight", desc: "Jazz-Age emerald with gold geometry.", tags: ["art deco", "emerald", "1920s"] },
  { d: "crest", id: "heirloom-crest", name: "Heirloom Crest", c: "timeless", art: "rose-garden-wreath", p: "ivory", f: "cinzel", desc: "Your interlaced initials in a rose wreath.", tags: ["monogram", "crest", "classic"] },
  { d: "crest", id: "admiral-crest", name: "Admiral Crest", c: "timeless", art: "navy-botanical-wreath", p: "sky", f: "playfair", desc: "A navy botanical crest with deep-blue bands.", tags: ["monogram", "navy", "crest"] },
  { d: "arbor", id: "orangery", name: "Orangery", c: "garden", art: "painted-peony-bouquet", p: "peach", f: "cormorant", desc: "Arched orangery windows in peach and green.", tags: ["arches", "garden", "peach"] },
  { d: "arbor", id: "wisteria-walk", name: "Wisteria Walk", c: "garden", art: "wisteria-gold-ring", p: "lilac", f: "italiana", desc: "A walk under wisteria arches.", tags: ["arches", "wisteria", "lilac"] },
  { d: "ribbon", id: "ruby-ribbon", name: "Ruby Ribbon", c: "timeless", art: "burgundy-leaf-wreath", p: "rose", f: "rozha", desc: "Your names on a ruby ribbon across a wreath.", tags: ["ribbon", "ruby", "romantic"] },
  { d: "ribbon", id: "sky-ribbon", name: "Sky Ribbon", c: "watercolour", art: "blue-hydrangea-geo", p: "sky", f: "prata", desc: "A sky-blue ribbon over painted hydrangeas.", tags: ["ribbon", "blue", "hydrangea"] },
  { d: "cameo", id: "victorian-cameo", name: "Victorian Cameo", c: "vintage", art: "vintage-pink-rose", p: "rose", f: "fell", desc: "Oval cameos and a Victorian rose.", tags: ["cameo", "victorian", "rose"] },
  { d: "cameo", id: "sage-cameo", name: "Sage Cameo", c: "garden", art: "pink-sprig-ring", p: "sage", f: "gilda", desc: "Sage cameos framing painted sprigs.", tags: ["cameo", "sage", "soft"] },
  { d: "quiet", id: "quiet-paper", name: "Paper", c: "modern", art: "sprigs-set-2", p: "paper", f: "tenor", desc: "Almost nothing: white paper, small type and air.", tags: ["minimal", "white", "quiet"] },
  { d: "quiet", id: "quiet-stone", name: "Stone", c: "modern", art: "sprigs-set-3", p: "stone", f: "italiana", desc: "Warm stone, hairlines and numbers.", tags: ["minimal", "stone", "quiet"] },
  { d: "washi", id: "sakura", name: "Sakura", c: "cultural", art: "cherry-blossom-bouquet", p: "blush", f: "mincho", desc: "Cherry blossom, vertical names and a red seal.", tags: ["japanese", "sakura", "washi"] },
  { d: "washi", id: "indigo", name: "Indigo", c: "cultural", art: "white-lily", p: "indigo", f: "mincho", finish: "white", desc: "Indigo-dyed calm with a white lily.", tags: ["japanese", "indigo", "washi"] },
  { d: "halo", id: "sun-halo", name: "Sun Halo", c: "watercolour", art: "sunny-wreath", p: "butter", f: "marcellus", desc: "A golden ring of sunshine and round medallions.", tags: ["circle", "yellow", "sunny"] },
  { d: "halo", id: "moon-halo", name: "Moon Halo", c: "timeless", art: "white-florals-spray", p: "midnight", f: "cormorant", desc: "A pale moon ring on midnight.", tags: ["circle", "night", "moon"] },
  { d: "diagonal", id: "poster-red", name: "Poster Red", c: "bold", art: "red-tulip-bunch", p: "red", f: "anton", desc: "Bias-cut bands, giant numbers and poster red.", tags: ["bold", "red", "graphic"] },
  { d: "diagonal", id: "cobalt", name: "Cobalt", c: "bold", art: "forget-me-not-stem", p: "cobalt", f: "bebas", desc: "Cobalt blue cut on the bias.", tags: ["bold", "blue", "graphic"] },
  { d: "ombre", id: "rose-ombre", name: "Rose Ombré", c: "watercolour", art: "pink-peony-wreath", p: "blush", f: "playfair", desc: "The page deepens from blush to rose.", tags: ["ombré", "pink", "gradient"] },
  { d: "ombre", id: "sea-ombre", name: "Sea Ombré", c: "destination", art: "white-florals-spray", p: "sea", f: "prata", desc: "From sea foam to deep teal, section by section.", tags: ["ombré", "teal", "coastal"] },
  { d: "verse", id: "sonnet", name: "Sonnet", c: "timeless", art: "vintage-pink-rose", p: "ivory", f: "fell", desc: "Your invitation as a sonnet, in italic stanzas.", tags: ["poem", "literary", "classic"] },
  { d: "verse", id: "lavender-verse", name: "Lavender Verse", c: "watercolour", art: "lavender-vase-bouquet", p: "lilac", f: "cormorant", desc: "Lilac stanzas and a vase of lavender.", tags: ["poem", "lavender", "soft"] },
  { d: "fold", id: "linen-fold", name: "Linen Fold", c: "timeless", art: "eucalyptus-gold-oval", p: "stone", f: "tenor", desc: "A tri-fold card on linen stock.", tags: ["folded", "linen", "classic"] },
  { d: "fold", id: "peach-fold", name: "Peach Fold", c: "watercolour", art: "peach-wreath", p: "peach", f: "playfair", desc: "A peach tri-fold with a painted wreath.", tags: ["folded", "peach", "warm"] },
  { d: "specimen", id: "didone", name: "Didone", c: "modern", art: "calla-lily", p: "paper", f: "bodoni", desc: "A Didone type specimen: huge initials, hairline rules.", tags: ["typography", "black", "modern"] },
  { d: "specimen", id: "grotesk", name: "Grotesk", c: "modern", art: "sprigs-set-2", p: "olive", f: "grotesk", desc: "A grotesk specimen sheet in olive.", tags: ["typography", "olive", "modern"] },
  { d: "countdown", id: "new-years-eve", name: "New Year's Eve", c: "bold", art: "gold-ring-blossom", p: "black", f: "bodoni", finish: "gold", desc: "Flip-clock tiles counting down in black and gold.", tags: ["countdown", "black", "gold"] },
  { d: "countdown", id: "spring-countdown", name: "Spring Countdown", c: "seasonal", art: "painted-red-tulips", p: "cream", f: "dmserif", desc: "Cream flip tiles and red tulips.", tags: ["countdown", "spring", "tulips"] },
  { d: "zine", id: "cut-and-paste", name: "Cut & Paste", c: "bold", art: "red-spray", p: "red", f: "anton", desc: "A photocopied zine with highlighter and cut-out type.", tags: ["zine", "diy", "black & white"] },
  { d: "zine", id: "pink-zine", name: "Pink Zine", c: "cute", art: "pink-rose-clip", p: "sorbet", f: "abril", desc: "A pink, hand-made zine all about you two.", tags: ["zine", "pink", "fun"] },
  { d: "sign", id: "acrylic-welcome", name: "Acrylic Welcome", c: "modern", art: "white-florals-spray", p: "blush", f: "cinzel", desc: "Clear acrylic signs over a painted rose pattern.", tags: ["signage", "acrylic", "blush"], extras: [LIB("pink-roses-pattern")] },
  { d: "sign", id: "garden-welcome", name: "Garden Welcome", c: "garden", art: "greenery-square", p: "sage", f: "marcellus", desc: "Glass welcome signs over botanical sprigs.", tags: ["signage", "garden", "sage"], extras: [LIB("botanical-sprigs")] },
  { d: "escort", id: "place-cards", name: "Place Cards", c: "timeless", art: "sprigs-set-2", p: "ivory", f: "cormorant", desc: "Folded place cards: please find your seat.", tags: ["place cards", "table", "classic"] },
  { d: "escort", id: "emerald-table", name: "Emerald Table", c: "timeless", art: "white-florals-spray", p: "emerald", f: "playfair", finish: "white", desc: "Emerald linen and white place cards.", tags: ["place cards", "emerald", "formal"] },
  { d: "planner", id: "blush-planner", name: "Blush Planner", c: "cute", art: "pink-sprig-ring", p: "blush", f: "yeseva", desc: "A blush planner with colour tabs and dot-grid pages.", tags: ["planner", "blush", "organised"] },
  { d: "planner", id: "navy-planner", name: "Navy Planner", c: "modern", art: "navy-botanical-wreath", p: "sky", f: "dmserif", desc: "A navy leather planner with tabbed sections.", tags: ["planner", "navy", "organised"] },
  { d: "journey", id: "treasure-map", name: "Treasure Map", c: "illustrated", art: "wildflower-posy", p: "manila", f: "fell", desc: "A dotted route from pin to pin, X marks the vows.", tags: ["map", "adventure", "vintage"] },
  { d: "journey", id: "coast-road", name: "Coast Road", c: "destination", art: "forget-me-not-teacup", p: "sea", f: "lora", desc: "A coastal road trip to the altar.", tags: ["map", "coastal", "road trip"] },
  { d: "hotel", id: "riviera-hotel", name: "Riviera Hotel", c: "destination", art: "gold-ring-pink-spray", p: "peach", f: "deco", desc: "Riviera hotel stationery, a room key and a lobby directory.", tags: ["hotel", "riviera", "retro"] },
  { d: "hotel", id: "alpine-lodge", name: "Alpine Lodge", c: "seasonal", art: "christmas-wreath", p: "forest", f: "cinzel", desc: "A mountain lodge in forest green and brass.", tags: ["hotel", "winter", "lodge"] },
  { d: "notebook", id: "love-notes", name: "Love Notes", c: "cute", art: "tiny-pink-posy", p: "sky", f: "hand", desc: "A lined notebook with doodles and a to-do list.", tags: ["notebook", "handwritten", "cute"] },
  { d: "notebook", id: "garden-journal", name: "Garden Journal", c: "garden", art: "sweet-pea-spray", p: "sage", f: "hand", desc: "A garden journal with pressed sweet peas.", tags: ["notebook", "garden", "handwritten"] },
  { d: "fan", id: "full-hand", name: "Full Hand", c: "bold", art: "red-rose-eucalyptus", p: "cream", f: "rozha", desc: "Three cards fanned in your hand, then a pinboard.", tags: ["cards", "playful", "red"] },
  { d: "fan", id: "blush-fan", name: "Blush Fan", c: "watercolour", art: "pastel-watercolour-wreath", p: "blush", f: "cormorant", desc: "A blush fan of watercolour cards.", tags: ["cards", "blush", "soft"] },
];

export const WAVE_THEMES: Theme[] = ROWS.map((r) => {
  const [bg, surface, text, muted, accent, onAccent] = P[r.p];
  const [display, body, script] = F[r.f] as Fonts;
  const decor: Decor = { heroFloral: r.art, ...(r.finish ? { finish: r.finish } : {}) };
  return {
    id: `w-${r.id}`,
    name: r.name,
    collection: r.c,
    template: r.d,
    hero: LIB(r.art),
    layout: "poster",
    description: r.desc,
    tags: r.tags,
    palette: { bg, surface, text, muted, accent, onAccent },
    fonts: { display, body, script },
    decor,
    effects: r.fx,
    extras: r.extras,
    heroFilter: r.finish ? FINISH_FILTERS[r.finish] : undefined,
  };
});
