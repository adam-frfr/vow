/* eslint-disable @next/next/no-img-element */
/**
 * Building blocks shared by templates. Each renders semantic markup with
 * `blk-*` class names; every template styles them its own way.
 */
import type { ReactNode } from "react";
import { formatDate, musicEmbed, sectionTitle, UPLOAD_URL, type SectionId } from "@/lib/content";
import { img } from "@/lib/themes";
import { events, mapsLink, safeUrl, type Ctx } from "./ctx";
import { RsvpForm } from "./RsvpForm";
import { WishesWall } from "./WishesWall";

export const title = (ctx: Ctx, id: SectionId) => sectionTitle(ctx.c, id);

export function Prose({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`blk-prose ${className}`}>
      {text
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </div>
  );
}

export function CalendarLink({ ctx, className = "", children }: { ctx: Ctx; className?: string; children?: ReactNode }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ctx.c.date)) return null;
  const live = ctx.mode === "live" && ctx.slug;
  return (
    <a className={`blk-cal ${className}`} href={live ? `/api/ics/${encodeURIComponent(ctx.slug!)}` : "#"} download={live ? true : undefined}>
      {children ?? "Add to calendar"}
    </a>
  );
}

export function DirectionsLink({ e, className = "", children }: { e: { venue: string; address: string; mapUrl: string }; className?: string; children?: ReactNode }) {
  if (!e.address && !e.mapUrl && !e.venue) return null;
  return (
    <a className={`blk-dir ${className}`} href={mapsLink(e)} target="_blank" rel="noopener noreferrer">
      {children ?? "Directions"}
    </a>
  );
}

export function MapEmbed({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  if (!ctx.c.details.showMap) return null;
  const e = events(ctx.c).find((x) => x.address);
  if (!e) return null;
  return (
    <div className={`blk-map ${className}`}>
      <iframe
        title={`Map of ${e.venue || e.address}`}
        src={`https://www.google.com/maps?q=${encodeURIComponent(e.address || e.venue)}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

/** Default event rendering: a list of events with time, venue, address, directions. */
export function EventList({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  return (
    <div className={`blk-events ${className}`}>
      {events(ctx.c).map((e, i) => (
        <article className="blk-event" key={i}>
          <h3 className="blk-event-title">{e.title}</h3>
          {e.time && <div className="blk-event-time">{e.time}</div>}
          <div className="blk-event-venue">{e.venue}</div>
          {e.address && <div className="blk-event-addr">{e.address}</div>}
          <DirectionsLink e={e} />
        </article>
      ))}
    </div>
  );
}

export function ScheduleList({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  return (
    <ol className={`blk-schedule ${className}`}>
      {ctx.c.schedule.items.map((it, i) => (
        <li key={i}>
          <span className="blk-s-time">{it.time}</span>
          <span className="blk-s-title">{it.title}</span>
          {it.detail && <span className="blk-s-detail">{it.detail}</span>}
        </li>
      ))}
    </ol>
  );
}

export function PartyGrid({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  return (
    <div className={`blk-party ${className}`}>
      {ctx.c.party.members
        .filter((m) => m.name)
        .map((m, i) => (
          <figure key={i} className="blk-member">
            {UPLOAD_URL.test(m.photo) ? (
              <img src={m.photo} alt={m.name} loading="lazy" />
            ) : (
              <span className="blk-member-mono" aria-hidden>
                {m.name.trim()[0]}
              </span>
            )}
            <figcaption>
              <b>{m.name}</b>
              <span>{m.role}</span>
            </figcaption>
          </figure>
        ))}
    </div>
  );
}

export function MusicEmbed({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  const e = musicEmbed(ctx.c.music.url);
  if (!e) return null;
  return (
    <div className={`blk-music blk-music--${e.kind} ${className}`}>
      {ctx.c.music.note && <p className="blk-music-note">{ctx.c.music.note}</p>}
      <iframe
        title="Our song"
        src={e.src}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export function RegistryLinks({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  const links = ctx.c.registry.links.filter((l) => safeUrl(l.url));
  return (
    <div className={`blk-registry ${className}`}>
      {ctx.c.registry.body && <Prose text={ctx.c.registry.body} />}
      {links.length > 0 && (
        <div className="blk-registry-links">
          {links.map((l, i) => (
            <a key={i} className="blk-btn" href={safeUrl(l.url)} target="_blank" rel="noopener noreferrer">
              {l.label || "Registry"}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function FaqList({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  return (
    <div className={`blk-faq ${className}`}>
      {ctx.c.faq.items.map((f, i) => (
        <details key={i}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Wishes({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  return (
    <div className={`blk-wishes ${className}`}>
      {ctx.c.wishes.body && <p className="blk-wishes-intro">{ctx.c.wishes.body}</p>}
      <WishesWall slug={ctx.slug} disabled={ctx.mode !== "live"} initial={ctx.wishes} />
    </div>
  );
}

export function Rsvp({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  const r = ctx.c.rsvp;
  return (
    <div className={`blk-rsvp ${className}`}>
      {r.deadline && <p className="blk-rsvp-deadline">Kindly reply by {formatDate(r.deadline, "short")}</p>}
      {r.body && <p className="blk-rsvp-body">{r.body}</p>}
      <RsvpForm slug={ctx.slug} disabled={ctx.mode !== "live"} askMeal={r.askMeal} mealOptions={r.mealOptions} maxGuests={r.maxGuests} />
    </div>
  );
}

/** Generic content for a section; templates override the ones they redesign. */
export function DefaultBlock({ id, ctx }: { id: SectionId; ctx: Ctx }) {
  switch (id) {
    case "story":
      return <Prose text={ctx.c.story.body} />;
    case "details":
      return (
        <>
          <EventList ctx={ctx} />
          <div className="blk-actions">
            <CalendarLink ctx={ctx} className="blk-btn" />
          </div>
          <MapEmbed ctx={ctx} />
        </>
      );
    case "schedule":
      return <ScheduleList ctx={ctx} />;
    case "party":
      return <PartyGrid ctx={ctx} />;
    case "gallery":
      return (
        <div className="blk-gallery">
          {ctx.gallery.map((src, i) => (
            <img key={i} src={img(src, 900)} alt="" loading="lazy" />
          ))}
        </div>
      );
    case "music":
      return <MusicEmbed ctx={ctx} />;
    case "travel":
      return <Prose text={ctx.c.travel.body} />;
    case "dressCode":
      return <Prose text={ctx.c.dressCode.body} />;
    case "registry":
      return <RegistryLinks ctx={ctx} />;
    case "faq":
      return <FaqList ctx={ctx} />;
    case "wishes":
      return <Wishes ctx={ctx} />;
    case "rsvp":
      return <Rsvp ctx={ctx} />;
  }
}

/**
 * Renders the visible sections in order. `wrap` gives the template full control
 * of each section's frame; `custom` replaces the content for specific sections.
 */
export function Sections({
  ctx,
  wrap,
  custom = {},
}: {
  ctx: Ctx;
  wrap: (id: SectionId, index: number, content: ReactNode) => ReactNode;
  custom?: Partial<Record<SectionId, (index: number) => ReactNode>>;
}) {
  return (
    <>
      {ctx.sections.map((id, i) => (
        <SectionSlot key={id}>{wrap(id, i, custom[id] ? custom[id]!(i) : <DefaultBlock id={id} ctx={ctx} />)}</SectionSlot>
      ))}
    </>
  );
}

function SectionSlot({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function GalleryImg({ src, w = 900, className = "", eager = false }: { src: string; w?: number; className?: string; eager?: boolean }) {
  return <img className={className} src={img(src, w)} alt="" loading={eager ? "eager" : "lazy"} />;
}

export function HeroImg({ ctx, w = 2000, className = "", contain = false }: { ctx: Ctx; w?: number; className?: string; contain?: boolean }) {
  return (
    <img
      className={className}
      src={img(ctx.hero, w)}
      alt=""
      style={{ filter: ctx.heroFilter, objectFit: contain ? "contain" : undefined }}
    />
  );
}

export function Credit({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  const cr = ctx.theme.credit;
  if (!cr || !ctx.heroIsTheme) return null;
  return (
    <span className={`blk-credit ${className}`}>
      {cr.artist}, <i>{cr.title}</i>, {cr.year}
    </span>
  );
}
