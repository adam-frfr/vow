/* eslint-disable @next/next/no-img-element */
/**
 * Shared building blocks for the "more" designs. Each design owns its hero and
 * section frames; these keep events, galleries, nav and art picking consistent.
 */
import type { ReactNode } from "react";
import "./kit.css";
import { formalTime, initials, type InviteContent, type SectionId } from "@/lib/content";
import { ALL_FLORALS, getFloral, type Floral, type FloralKind } from "@/lib/assets";
import { familyOf, floralFamilies } from "@/lib/decor";
import { img } from "@/lib/themes";
import { CalendarLink, DirectionsLink, GalleryImg, MapEmbed, Prose, title } from "../../blocks";
import { FloralArt } from "../../Decor";
import { events, ROMAN, type Ctx } from "../../ctx";

export { formalTime, initials, title, ROMAN };

const idOf = (u: string) => u.match(/\/(?:library|florals)\/([a-z0-9-]+)\.webp$/)?.[1];

/** True when the theme's main image is painted art (transparent), not a photo. */
export const heroIsArt = (ctx: Ctx) => !!idOf(ctx.hero) && getFloral(idOf(ctx.hero))?.kind !== "texture";

/** Painted art for a design: the theme's own picks first, then palette-matched library art. */
export function pickArt(ctx: Ctx, kinds: FloralKind[], n = 6): Floral[] {
  const ok = (f: Floral) => kinds.includes(f.kind) && !(ctx.dark && f.tone === "light" && !ctx.decor.finish);
  const own = [ctx.hero, ...(ctx.theme.extras ?? [])].map(idOf).map((id) => getFloral(id)).filter((f): f is Floral => !!f && ok(f));
  const fam = familyOf(ctx.theme.palette.accent);
  const seed = [...ctx.theme.id].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const pool = ALL_FLORALS.filter((f) => ok(f) && floralFamilies(f).includes(fam) && !own.includes(f));
  const rest = pool.length ? pool : ALL_FLORALS.filter(ok);
  const rotated = rest.map((_, i) => rest[(i + seed) % rest.length]);
  const out = [...own, ...rotated];
  return out.slice(0, Math.max(n, 1));
}

/** The hero piece: couple's chosen hero art, else the theme's art, else a matched piece. */
export function heroPiece(ctx: Ctx, kinds: FloralKind[] = ["wreath", "frame", "bouquet"]): Floral | undefined {
  const chosen = getFloral(ctx.decor.heroFloral);
  return chosen && kinds.includes(chosen.kind) ? chosen : pickArt(ctx, kinds, 1)[0];
}

export function Art({ ctx, f, className = "", origin, auto, delay }: { ctx: Ctx; f?: Floral; className?: string; origin?: "tl" | "tr" | "bl" | "br"; auto?: boolean; delay?: number }) {
  if (!f) return null;
  return <FloralArt floral={f} ctx={ctx} className={className} origin={origin} auto={auto} delay={delay} />;
}

/** A paper/wash texture is a background, not a picture: those themes show a photo instead. */
const heroIsTexture = (ctx: Ctx) => getFloral(idOf(ctx.hero))?.kind === "texture";

/** The theme image: painted art shown whole, photographs cropped to fill. */
export function Picture({ ctx, className = "", w = 1600 }: { ctx: Ctx; className?: string; w?: number }) {
  const texture = heroIsTexture(ctx);
  const art = heroIsArt(ctx);
  const src = texture ? photo(ctx, 0) : ctx.hero;
  return (
    <img
      className={`kx-pic ${art ? "kx-pic--art" : "kx-pic--photo"} ${className}`}
      src={img(src, w)}
      alt=""
      style={{ filter: texture ? undefined : ctx.heroFilter }}
    />
  );
}

/** A photo for slot i: the couple's gallery (samples in demos). */
export const photo = (ctx: Ctx, i: number) => (ctx.gallery.length ? ctx.gallery[i % ctx.gallery.length] : ctx.hero);

/** A photograph for photo-led designs: the cover photo, else the first gallery photo. */
export const heroPhoto = (ctx: Ctx) => (idOf(ctx.hero) ? photo(ctx, 0) : ctx.hero);

export function dateBits(c: InviteContent) {
  const ok = /^\d{4}-\d{2}-\d{2}$/.test(c.date);
  if (!ok) return null;
  const dt = new Date(`${c.date}T12:00:00Z`);
  const f = (o: Intl.DateTimeFormatOptions) => dt.toLocaleDateString("en-US", { ...o, timeZone: "UTC" });
  return {
    d: c.date.slice(8),
    m: c.date.slice(5, 7),
    y: c.date.slice(0, 4),
    yy: c.date.slice(2, 4),
    mon: f({ month: "short" }),
    month: f({ month: "long" }),
    wd: f({ weekday: "long" }),
    dt,
  };
}

export function Nav({ ctx, className = "", mark }: { ctx: Ctx; className?: string; mark?: (i: number) => ReactNode }) {
  return (
    <nav className={`kx-nav ${className}`}>
      {ctx.sections.map((id, i) => (
        <a key={id} href={`#${id}`}>
          {mark && <span className="kx-nav-mark">{mark(i)}</span>}
          {title(ctx, id)}
        </a>
      ))}
    </nav>
  );
}

export function Events({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  return (
    <>
      <div className={`kx-events ${className}`}>
        {events(ctx.c).map((e, i) => (
          <article key={i} className="kx-event">
            <p className="k kx-event-k">{e.title}</p>
            {e.time && <p className="d kx-event-time">{e.time}</p>}
            <p className="kx-event-venue">{e.venue}</p>
            <p className="m kx-event-addr">{e.address}</p>
            <DirectionsLink e={e} className="kx-link" />
          </article>
        ))}
      </div>
      <CalendarLink ctx={ctx} className="kx-link kx-cal" />
      <MapEmbed ctx={ctx} className="kx-map" />
    </>
  );
}

export function Photos({ ctx, className = "", w = 800, caption }: { ctx: Ctx; className?: string; w?: number; caption?: (i: number) => ReactNode }) {
  return (
    <div className={`kx-gallery ${className}`}>
      {ctx.gallery.map((src, i) =>
        caption ? (
          <figure key={i}>
            <GalleryImg src={src} w={w} />
            <figcaption>{caption(i)}</figcaption>
          </figure>
        ) : (
          <GalleryImg key={i} src={src} w={w} />
        ),
      )}
    </div>
  );
}

/** Standard content overrides; designs pass class names to restyle them. */
export function std(ctx: Ctx, o: { prose?: string; events?: string; gallery?: string; caption?: (i: number) => ReactNode; w?: number } = {}) {
  return {
    story: () => <Prose text={ctx.c.story.body} className={`kx-prose ${o.prose ?? ""}`} />,
    details: () => <Events ctx={ctx} className={o.events} />,
    gallery: () => <Photos ctx={ctx} className={o.gallery} caption={o.caption} w={o.w} />,
  } satisfies Partial<Record<SectionId, (i: number) => ReactNode>>;
}

/** The first event's venue/time, for invitation-style heroes. */
export function firstEvent(ctx: Ctx) {
  const e = events(ctx.c)[0];
  return e ? { ...e, formal: e.time ? formalTime(e.time) : "" } : undefined;
}
