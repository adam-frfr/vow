import "./candlelit.css";
import { Fragment } from "react";
import { CalendarLink, DirectionsLink, GalleryImg, MapEmbed, Prose, Sections, title } from "../blocks";
import { events, ROMAN, type Ctx } from "../ctx";
import { CandleHero, GlitterClose, MatchInterlude } from "./CandlelitMotion";

/**
 * Candlelit: a dark evening invitation built around real flame footage.
 * Scrolling lights the candle; a match strike introduces the RSVP; gold
 * glitter closes the night.
 */
export function Candlelit({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const hero = ctx.decor.cutout && ["candle-lights", "match-strike", "gold-glitter"].includes(ctx.decor.cutout) ? ctx.decor.cutout : "candle-lights";
  const [first, ...rest] = c.story.body.split(/\n{2,}/).filter(Boolean);
  return (
    <div className="t-cd">
      <CandleHero
        cutoutId={hero}
        headline={c.headline}
        p1={ctx.p1}
        p2={ctx.p2}
        date={ctx.date}
        location={c.location}
        isoDate={c.date}
      />

      <nav className="cd-nav">
        {ctx.sections.map((id) => (
          <a key={id} href={`#${id}`}>
            {title(ctx, id)}
          </a>
        ))}
      </nav>

      <Sections
        ctx={ctx}
        decor={false}
        cutout={false}
        wrap={(id, i, content) => (
          <Fragment>
            {id === "rsvp" && hero !== "match-strike" && <MatchInterlude />}
            <section id={id} className={`cd-sec cd-sec--${id}`}>
              <p className="cd-no">{ROMAN[i]}</p>
              <h2 className="d cd-h">{title(ctx, id)}</h2>
              <div className="cd-flame-rule" aria-hidden />
              <div className="cd-body">{content}</div>
            </section>
          </Fragment>
        )}
        custom={{
          story: () =>
            first ? (
              <div className="cd-story">
                <p className="cd-lede d">{first}</p>
                {rest.length > 0 && <Prose text={rest.join("\n\n")} />}
              </div>
            ) : null,
          details: () => (
            <>
              <div className="cd-events">
                {events(c).map((e, i) => (
                  <article key={i} className="cd-event">
                    <p className="k">{e.title}</p>
                    <p className="d cd-event-time">{e.time}</p>
                    <p>{e.venue}</p>
                    <p className="m">{e.address}</p>
                    <DirectionsLink e={e} className="cd-link" />
                  </article>
                ))}
              </div>
              <div className="cd-center">
                <CalendarLink ctx={ctx} className="cd-link" />
              </div>
              <MapEmbed ctx={ctx} className="cd-map" />
            </>
          ),
          schedule: () => (
            <ol className="cd-sched">
              {c.schedule.items.map((it, i) => (
                <li key={i}>
                  <span className="d cd-sched-time">{it.time}</span>
                  <span className="cd-sched-body">
                    <b>{it.title}</b>
                    <span className="m">{it.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          ),
          gallery: () => (
            <div className="cd-gallery gal-tpl">
              {ctx.gallery.map((src, i) => (
                <GalleryImg key={i} src={src} w={800} />
              ))}
            </div>
          ),
        }}
      />

      <GlitterClose names={`${ctx.p1} & ${ctx.p2} · ${ctx.date}`} />
    </div>
  );
}
