import { z } from "zod";

const str = (max: number) => z.string().max(max).default("");

export const SECTION_IDS = ["story", "details", "schedule", "gallery", "travel", "dressCode", "registry", "faq", "rsvp"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  story: "Our Story",
  details: "Ceremony & Reception",
  schedule: "Schedule",
  gallery: "Gallery",
  travel: "Travel & Stay",
  dressCode: "Dress Code",
  registry: "Registry",
  faq: "FAQ",
  rsvp: "RSVP",
};

const event = z.object({
  title: str(80),
  time: str(40),
  venue: str(120),
  address: str(200),
  mapUrl: str(500),
});

export const contentSchema = z.object({
  partner1: str(60),
  partner2: str(60),
  date: str(20), // YYYY-MM-DD
  headline: str(120), // "Together with their families"
  tagline: str(200), // "invite you to celebrate their wedding"
  location: str(120), // "Florence, Italy"
  sectionOrder: z.array(z.enum(SECTION_IDS)).default([...SECTION_IDS]),
  hidden: z.array(z.enum(SECTION_IDS)).default([]),
  titles: z.partialRecord(z.enum(SECTION_IDS), z.string().max(80)).default({}),
  story: z.object({ body: str(4000) }).default({ body: "" }),
  details: z.object({ ceremony: event, reception: event }).default({
    ceremony: { title: "", time: "", venue: "", address: "", mapUrl: "" },
    reception: { title: "", time: "", venue: "", address: "", mapUrl: "" },
  }),
  schedule: z
    .object({ items: z.array(z.object({ time: str(40), title: str(80), detail: str(200) })).max(20) })
    .default({ items: [] }),
  travel: z.object({ body: str(3000) }).default({ body: "" }),
  dressCode: z.object({ body: str(1000) }).default({ body: "" }),
  registry: z
    .object({ body: str(1000), links: z.array(z.object({ label: str(60), url: str(500) })).max(10) })
    .default({ body: "", links: [] }),
  faq: z.object({ items: z.array(z.object({ q: str(200), a: str(1000) })).max(30) }).default({ items: [] }),
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
});
export type Customization = z.infer<typeof customizationSchema>;

export function parseContent(json: string): InviteContent {
  try {
    return contentSchema.parse(JSON.parse(json));
  } catch {
    return contentSchema.parse({});
  }
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
      ceremony: { title: "The Ceremony", time: "4:00 PM", venue: "Villa Medici Gardens", address: "Via della Fontana 12, Florence", mapUrl: "" },
      reception: { title: "The Reception", time: "6:30 PM", venue: "The Orangery", address: "Via della Fontana 12, Florence", mapUrl: "" },
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
    travel: {
      body:
        "The nearest airport is Florence Peretola (FLR), about 20 minutes away. We've reserved a block of rooms at Hotel Lungarno — mention our names when booking for the group rate.",
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
    rsvp: { deadline: "", body: "We would be honoured by your presence. Kindly let us know if you can make it.", askMeal: true, mealOptions: ["Beef", "Fish", "Vegetarian"], maxGuests: 2 },
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
