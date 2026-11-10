/**
 * The printed invitation that matches a theme: same painted art, palette and
 * type, laid out as a 5×7" card (front) with a details/QR back.
 */
import { ALL_FLORALS, getFloral, type Floral } from "./assets";
import { formalDate, type Customization, type InviteContent } from "./content";
import { familyOf, FINISH_FILTERS, floralFamilies, luminance, resolveDecorStyle } from "./decor";
import type { CardSettings } from "./stickers";
import { templateOf, TEMPLATE_IDS, type TemplateId, type Theme } from "./themes";

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const artIdFromUrl = (u: string) => u.match(/^\/(?:library|florals)\/([a-z0-9-]+)\.webp$/)?.[1];

export interface ResolvedCard {
  style: NonNullable<CardSettings["style"]>;
  colorway: NonNullable<CardSettings["colorway"]>;
  finish: NonNullable<CardSettings["finish"]>;
  art?: Floral;
  pattern?: Floral;
  colors: { bg: string; fg: string; muted: string; accent: string; backBg: string; backFg: string };
  fonts: { display: string; body: string; script: string };
  lines: { top: string; p1: string; p2: string; invite: string; date: string[]; venue: string; place: string; extra: string; reply: string };
  initials: string;
}

export function resolveCard(theme: Theme, c: InviteContent, cz: Customization = {}): ResolvedCard {
  const s = cz.card ?? {};
  const tpl: TemplateId = cz.template && (TEMPLATE_IDS as string[]).includes(cz.template) ? (cz.template as TemplateId) : templateOf(theme);
  const { decor } = resolveDecorStyle(theme, tpl, { decor: cz.decor, style: cz.style });
  const pal = theme.palette;
  const bg0 = cz.bg || pal.bg;
  const text0 = cz.text || pal.text;
  const accent0 = cz.accent || pal.accent;
  const themeDark = luminance(bg0) < 0.12;
  const fam = familyOf(accent0);

  // Art: the couple's pick → the theme's own painted frame/plate → a palette-matched wreath.
  const heroArt = artIdFromUrl(theme.hero);
  const candidates = ALL_FLORALS.filter((f) => (f.kind === "wreath" || f.kind === "frame") && floralFamilies(f).includes(fam));
  const art =
    getFloral(s.art) ??
    getFloral(decor.heroFloral) ??
    (heroArt && getFloral(heroArt)?.kind !== "pattern" ? getFloral(heroArt) : undefined) ??
    candidates[hash(theme.id) % Math.max(1, candidates.length)];
  const patterns = ALL_FLORALS.filter((f) => f.kind === "pattern");
  const pattern =
    getFloral(s.pattern) ??
    (heroArt && getFloral(heroArt)?.kind === "pattern" ? getFloral(heroArt) : undefined) ??
    getFloral(decor.pattern) ??
    patterns.find((p) => floralFamilies(p).includes(fam)) ??
    patterns[0];

  const style =
    s.style ??
    (tpl === "stationery" ? "liner" : art && (art.kind === "bouquet" || art.kind === "elements") ? "crown" : art?.kind === "corner" ? "corners" : "wreath");
  const colorway = s.colorway ?? "theme";

  let bg = bg0, fg = text0, accent = accent0;
  if (colorway === "paper") {
    bg = "#FAF6EE";
    fg = "#2B2620";
  } else if (colorway === "inverse") {
    [bg, fg] = themeDark ? [text0, bg0] : [luminance(text0) < 0.05 ? text0 : `color-mix(in srgb, ${text0} 80%, #000)`, bg0];
    accent = `color-mix(in srgb, ${accent0} 45%, ${fg})`;
  }
  const darkCard = colorway === "inverse" ? !themeDark : colorway === "paper" ? false : themeDark;
  const finish = s.finish ?? (decor.finish && decor.finish !== "painted" ? decor.finish : undefined) ?? (darkCard && art?.tone === "light" ? "white" : colorway === "inverse" ? "white" : "painted");

  const fd = formalDate(c.date);
  const [y, m, d] = /^\d{4}-\d{2}-\d{2}$/.test(c.date) ? c.date.split("-") : ["", "", ""];
  const month = m ? new Date(Date.UTC(2000, Number(m) - 1, 1)).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase() : "";
  const ceremony = c.details.ceremony;
  const reception = c.details.reception;

  return {
    style,
    colorway,
    finish,
    art,
    pattern,
    colors: {
      bg,
      fg,
      muted: `color-mix(in srgb, ${fg} 68%, ${bg})`,
      accent,
      backBg: colorway === "inverse" ? `color-mix(in srgb, ${bg} 72%, ${accent0})` : `color-mix(in srgb, ${accent0} 88%, ${bg})`,
      backFg: colorway === "inverse" ? fg : pal.onAccent,
    },
    fonts: {
      display: cz.displayFont || theme.fonts.display,
      body: cz.bodyFont || theme.fonts.body,
      script: cz.scriptFont || theme.fonts.script || cz.displayFont || theme.fonts.display,
    },
    lines: {
      top: s.top ?? (c.headline || "Together with their families"),
      p1: c.partner1 || "Partner",
      p2: c.partner2 || "Partner",
      invite: s.invite ?? (c.tagline || "joyfully invite you to their wedding celebration"),
      date: fd ? [month, d, y] : ["Date", "to be", "announced"],
      venue: s.venue ?? (ceremony.venue || c.location || ""),
      place: s.place ?? (ceremony.venue ? c.location || ceremony.address : ""),
      extra: s.extra ?? (reception.venue || reception.title ? "dinner and dancing to follow" : ""),
      reply: s.reply ?? (c.rsvp.deadline ? `Kindly reply by ${new Date(c.rsvp.deadline + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" })}` : "Kindly reply online"),
    },
    initials: `${(c.partner1 || "A").trim()[0]?.toUpperCase() ?? "A"} & ${(c.partner2 || "B").trim()[0]?.toUpperCase() ?? "B"}`,
  };
}

/** CSS filter that turns painted art into a print finish. */
export const FINISH_FILTER: Record<ResolvedCard["finish"], string | undefined> = FINISH_FILTERS;
