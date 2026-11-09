import { formatDate, musicEmbed, UPLOAD_URL, type InviteContent, type SectionId } from "@/lib/content";
import type { Theme } from "@/lib/themes";

export type Mode = "live" | "preview" | "demo";
export interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

/** Everything a template needs to render a site. */
export interface Ctx {
  theme: Theme;
  c: InviteContent;
  mode: Mode;
  slug?: string;
  /** Main image: uploaded cover if set, otherwise the theme image. */
  hero: string;
  /** True when hero is the theme's own image (so artwork credits apply). */
  heroIsTheme: boolean;
  heroFilter?: string;
  /** Gallery photos (user uploads; samples in preview/demo). */
  gallery: string[];
  wishes: Wish[];
  /** Visible sections, in the couple's order, with empty ones removed. */
  sections: SectionId[];
  p1: string;
  p2: string;
  date: string; // "Saturday, June 12, 2027" or ""
}

export function events(c: InviteContent) {
  return [c.details.ceremony, c.details.reception].filter((e) => e.venue || e.title);
}

export function hasContent(id: SectionId, ctx: Pick<Ctx, "c" | "gallery">): boolean {
  const { c } = ctx;
  switch (id) {
    case "story":
      return !!c.story.body.trim();
    case "details":
      return events(c).length > 0;
    case "schedule":
      return c.schedule.items.length > 0;
    case "party":
      return c.party.members.some((m) => m.name);
    case "gallery":
      return ctx.gallery.length > 0;
    case "music":
      return !!musicEmbed(c.music.url);
    case "travel":
      return !!c.travel.body.trim();
    case "dressCode":
      return !!c.dressCode.body.trim();
    case "registry":
      return !!c.registry.body.trim() || c.registry.links.length > 0;
    case "faq":
      return c.faq.items.length > 0;
    case "wishes":
    case "rsvp":
      return true;
  }
}

export function buildCtx(args: {
  theme: Theme;
  c: InviteContent;
  mode: Mode;
  slug?: string;
  coverUrl?: string;
  photos: string[];
  sampleGallery: string[];
  wishes: Wish[];
}): Ctx {
  const { theme, c, mode } = args;
  const gallery = args.photos.length ? args.photos : mode === "live" ? [] : args.sampleGallery;
  const cover = args.coverUrl && UPLOAD_URL.test(args.coverUrl) ? args.coverUrl : undefined;
  const sections = c.sectionOrder.filter((id) => !c.hidden.includes(id) && hasContent(id, { c, gallery }));
  return {
    theme,
    c,
    mode,
    slug: args.slug,
    hero: cover ?? theme.hero,
    heroIsTheme: !cover,
    heroFilter: !cover ? theme.heroFilter : undefined,
    gallery,
    wishes: args.wishes,
    sections,
    p1: c.partner1 || "Partner One",
    p2: c.partner2 || "Partner Two",
    date: formatDate(c.date),
  };
}

/** Only allow http(s) links from user content. */
export function safeUrl(u: string) {
  try {
    const url = new URL(u);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export function mapsLink(e: { venue: string; address: string; mapUrl: string }) {
  return safeUrl(e.mapUrl) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue} ${e.address}`.trim())}`;
}

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"];
export const WORDS = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen"];
export const pad2 = (n: number) => String(n).padStart(2, "0");
