import { z } from "zod";
import { cardSchema, effectsSchema, stickerSchema } from "./stickers";
import { decorSchema, styleSchema } from "./decor";

const str = (max: number) => z.string().max(max).default("");

export const SECTION_IDS = [
  "story", "details", "schedule", "party", "gallery", "music", "travel", "dressCode", "registry", "faq", "wishes", "rsvp",
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  story: "Our Story",
  details: "Ceremony & Reception",
  schedule: "Schedule",
  party: "Wedding Party",
  gallery: "Gallery",
  music: "Our Song",
  travel: "Travel & Stay",
  dressCode: "Dress Code",
  registry: "Registry",
  faq: "FAQ",
  wishes: "Guestbook",
  rsvp: "RSVP",
};

const event = z.object({
  title: str(80),
  time: str(40),
  venue: str(120),
  address: str(200),
  mapUrl: str(500),
});
const emptyEvent = { title: "", time: "", venue: "", address: "", mapUrl: "" };

export const contentSchema = z.object({
  partner1: str(60),
  partner2: str(60),
  date: str(20), // YYYY-MM-DD
  headline: str(120), // "Together with their families"
  tagline: str(200), // "invite you to celebrate their wedding"
  location: str(120), // "Florence, Italy"
  intro: z.boolean().default(true), // "open the invitation" splash on the live site
  sectionOrder: z.array(z.enum(SECTION_IDS)).default([...SECTION_IDS]),
  hidden: z.array(z.enum(SECTION_IDS)).default([]),
  titles: z.partialRecord(z.enum(SECTION_IDS), z.string().max(80)).default({}),
  story: z.object({ body: str(4000) }).default({ body: "" }),
  details: z
    .object({ ceremony: event, reception: event, showMap: z.boolean().default(true) })
    .default({ ceremony: emptyEvent, reception: emptyEvent, showMap: true }),
  schedule: z
    .object({ items: z.array(z.object({ time: str(40), title: str(80), detail: str(200) })).max(20) })
    .default({ items: [] }),
  party: z
    .object({ members: z.array(z.object({ name: str(80), role: str(80), photo: str(200) })).max(24) })
    .default({ members: [] }),
  music: z.object({ url: str(300), note: str(300) }).default({ url: "", note: "" }),
  travel: z.object({ body: str(3000) }).default({ body: "" }),
  dressCode: z.object({ body: str(1000) }).default({ body: "" }),
  registry: z
    .object({ body: str(1000), links: z.array(z.object({ label: str(60), url: str(500) })).max(10) })
    .default({ body: "", links: [] }),
  faq: z.object({ items: z.array(z.object({ q: str(200), a: str(1000) })).max(30) }).default({ items: [] }),
  wishes: z.object({ body: str(300) }).default({ body: "" }),
  /** "Ask us anything": an AI helper on the live site that answers from this content only. */
  ask: z.object({ enabled: z.boolean().default(false) }).default({ enabled: false }),
  rsvp: z
    .object({
      deadline: str(20),
      body: str(500),
      askMeal: z.boolean().default(false),
      mealOptions: z.array(z.string().max(60)).max(8).default([]),
      maxGuests: z.number().int().min(1).max(10).default(2),
    })
    .default({ deadline: "", body: "", askMeal: false, mealOptions: [], maxGuests: 2 }),
});

export type InviteContent = z.infer<typeof contentSchema>;

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const customizationSchema = z.object({
  accent: hex.optional(),
  bg: hex.optional(),
  text: hex.optional(),
  displayFont: z.string().max(60).optional(),
  bodyFont: z.string().max(60).optional(),
  scriptFont: z.string().max(60).optional(),
  // An uploaded photo (served from our own storage) that replaces the theme hero.
  coverUrl: z.string().max(200).regex(/^\/api\/uploads\/[\w-]+\/[\w-]+\.(jpg|png|webp)$/).optional(),
  /** Use a different site design with this theme's look. */
  template: z.string().max(40).optional(),
  decor: decorSchema.optional(),
  style: styleSchema.optional(),
  /** Library art the couple placed themselves. */
  stickers: z.array(stickerSchema).max(60).optional(),
  effects: effectsSchema.optional(),
  /** The matching printed invitation. */
  card: cardSchema.optional(),
  /** Second language for the live site (guests switch with a button). */
  translation: z
    .object({
      lang: z.string().max(40),
      fields: z.object({
        headline: z.string().max(120),
        tagline: z.string().max(200),
        story: z.string().max(4000),
        travel: z.string().max(3000),
        dressCode: z.string().max(1000),
        registry: z.string().max(1000),
        rsvp: z.string().max(500),
        wishes: z.string().max(300),
        faq: z.array(z.object({ q: z.string().max(200), a: z.string().max(1000) })).max(30),
        titles: z.record(z.string(), z.string().max(80)),
      }),
    })
    .optional(),
});
export type Customization = z.infer<typeof customizationSchema>;

export const UPLOAD_URL = /^\/api\/uploads\/[\w-]+\/[\w-]+\.(jpg|png|webp)$/;

export function parseContent(json: string): InviteContent {
  let c: InviteContent;
  try {
    c = contentSchema.parse(JSON.parse(json));
  } catch {
    c = contentSchema.parse({});
  }
  return normalizeOrder(c);
}

/** Sites saved before new sections existed get them inserted at their default position. */
export function normalizeOrder(c: InviteContent): InviteContent {
  const order = c.sectionOrder.filter((id, i, a) => a.indexOf(id) === i);
  for (const id of SECTION_IDS) {
    if (!order.includes(id)) {
      const before = SECTION_IDS.slice(SECTION_IDS.indexOf(id) + 1).find((n) => order.includes(n));
      order.splice(before ? order.indexOf(before) : order.length, 0, id);
    }
  }
  return { ...c, sectionOrder: order };
}

export function parseCustomization(json: string): Customization {
  const r = customizationSchema.safeParse(safeJson(json));
  return r.success ? r.data : {};
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

export function sectionTitle(c: InviteContent, id: SectionId) {
  return c.titles[id] || SECTION_LABELS[id];
}

/** Pull a playable embed URL out of a Spotify or YouTube link. */
export function musicEmbed(url: string): { src: string; kind: "spotify" | "youtube" } | null {
  try {
    const u = new URL(url);
    if (u.hostname === "open.spotify.com") {
      const m = u.pathname.match(/^\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]{10,40})/);
      if (m) return { kind: "spotify", src: `https://open.spotify.com/embed/${m[1]}/${m[2]}` };
    }
    let id: string | null = null;
    if (u.hostname === "youtu.be") id = u.pathname.slice(1);
    if (/(^|\.)youtube\.com$/.test(u.hostname)) id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1] ?? null;
    if (id && /^[\w-]{6,20}$/.test(id)) return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${id}` };
  } catch {}
  return null;
}

/** Formal invitation wording: { weekday: "Saturday", line: "the twelfth of June", year: "two thousand twenty-seven" } */
export function formalDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const weekday = date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  const month = date.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  const ord = [
    "", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth",
    "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth", "twentieth", "twenty-first",
    "twenty-second", "twenty-third", "twenty-fourth", "twenty-fifth", "twenty-sixth", "twenty-seventh", "twenty-eighth",
    "twenty-ninth", "thirtieth", "thirty-first",
  ][d];
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen",
    "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const rest = y % 100;
  const words = rest < 20 ? ones[rest] : tens[Math.floor(rest / 10)] + (rest % 10 ? `-${ones[rest % 10]}` : "");
  return { weekday, line: `the ${ord} of ${month}`, year: `two thousand${words ? ` ${words}` : ""}` };
}

/** "4:00 PM" -> "four o'clock in the afternoon" (best effort). */
export function formalTime(t: string) {
  const m = t.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return t;
  const words = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const pm = (m[3] ?? "").toLowerCase() === "pm" || (!m[3] && h >= 12);
  if (h > 12) h -= 12;
  const hw = words[h % 12];
  const mw = min === 0 ? "o'clock" : min === 30 ? "thirty" : String(min).padStart(2, "0");
  const part = !pm ? "in the morning" : h % 12 < 5 ? "in the afternoon" : "in the evening";
  return min === 30 ? `half past ${hw} ${part}` : `${hw} ${mw} ${part}`;
}

export function initials(c: InviteContent) {
  return [(c.partner1 || "A").trim()[0] ?? "A", (c.partner2 || "B").trim()[0] ?? "B"].map((s) => s.toUpperCase());
}

/** Sensible starting copy so a new site looks finished from minute one. */
export function starterContent(partner1: string, partner2: string, date: string): InviteContent {
  return contentSchema.parse({
    partner1,
    partner2,
    date,
    headline: "Together with their families",
    tagline: "invite you to celebrate their wedding",
    location: "Florence, Italy",
    story: {
      body:
        "We met on a rainy Tuesday in a tiny bookshop, both reaching for the last copy of the same novel. One coffee turned into dinner, dinner turned into years, and years turned into the easiest question we've ever answered.\n\nWe can't wait to celebrate with the people who mean the most to us.",
    },
    details: {
      ceremony: { title: "The Ceremony", time: "4:00 PM", venue: "Villa Medici Gardens", address: "Piazza della Signoria, Florence", mapUrl: "" },
      reception: { title: "The Reception", time: "6:30 PM", venue: "The Orangery", address: "Piazza della Signoria, Florence", mapUrl: "" },
      showMap: true,
    },
    schedule: {
      items: [
        { time: "3:30 PM", title: "Guests Arrive", detail: "Welcome drinks in the garden" },
        { time: "4:00 PM", title: "Ceremony", detail: "Beneath the old olive tree" },
        { time: "5:00 PM", title: "Cocktail Hour", detail: "Aperitivo on the terrace" },
        { time: "6:30 PM", title: "Dinner & Toasts", detail: "In the Orangery" },
        { time: "9:00 PM", title: "Dancing", detail: "Until the stars give out" },
      ],
    },
    party: {
      members: [
        { name: "Emma Clarke", role: "Maid of Honour", photo: "" },
        { name: "Daniel Reyes", role: "Best Man", photo: "" },
        { name: "Sofia Laurent", role: "Bridesmaid", photo: "" },
        { name: "Noah Bennett", role: "Groomsman", photo: "" },
      ],
    },
    music: { url: "", note: "The song that was playing the night we met." },
    travel: {
      body:
        "The nearest airport is Florence Peretola (FLR), about 20 minutes away. We've reserved a block of rooms at Hotel Lungarno; mention our names when booking for the group rate.",
    },
    dressCode: { body: "Garden formal. Think linen suits, flowing dresses and comfortable shoes for the lawn." },
    registry: {
      body: "Your presence is the greatest gift. If you'd like to honour us further, we've put together a small registry.",
      links: [{ label: "View our registry", url: "https://example.com" }],
    },
    faq: {
      items: [
        { q: "Can I bring a plus one?", a: "Your invitation will list the names of all invited guests." },
        { q: "Are children welcome?", a: "We love your little ones, but this will be an adults-only celebration." },
        { q: "Is there parking?", a: "Yes, free parking is available at the venue." },
      ],
    },
    wishes: { body: "Leave us a note, a memory or a piece of marriage advice. We'll treasure every word." },
    rsvp: {
      deadline: "",
      body: "We would be honoured by your presence. Kindly let us know if you can make it.",
      askMeal: true,
      mealOptions: ["Beef", "Fish", "Vegetarian"],
      maxGuests: 2,
    },
  });
}

export function sampleContent(): InviteContent {
  const d = new Date();
  d.setMonth(d.getMonth() + 8);
  const iso = d.toISOString().slice(0, 10);
  const c = starterContent("Olivia", "James", iso);
  c.rsvp.deadline = new Date(d.getTime() - 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10);
  return c;
}

export const SAMPLE_WISHES = [
  { id: "s1", name: "Grandma Rose", message: "Never go to bed angry, and always share dessert. So proud of you both!", createdAt: "" },
  { id: "s2", name: "The Hendersons", message: "Counting down the days. Save us a spot on the dance floor!", createdAt: "" },
  { id: "s3", name: "Priya", message: "From college roommates to this. I'm crying already.", createdAt: "" },
];

export function formatDate(iso: string, style: "long" | "short" = "long") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: style === "long" ? "long" : undefined,
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Compact numeric date, e.g. 06 · 12 · 2027 */
export function dotDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-");
  return `${m} · ${d} · ${y}`;
}

export const RESERVED_SLUGS = new Set([
  "api", "login", "signup", "logout", "dashboard", "themes", "uploads", "admin", "about", "pricing", "help", "terms", "privacy", "_next", "static",
]);

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
