import "./grand.css";
import { Fragment } from "react";
import { img } from "@/lib/themes";
import { CalendarLink, DirectionsLink, GalleryImg, HeroImg, MapEmbed, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { events, type Ctx } from "../ctx";

const INTERLUDES = [
  "Two souls, one heart",
  "Whatever our souls are made of, theirs are the same",
  "And so the adventure begins",
  "Love is patient, love is kind",
];

/** Ballroom grandeur: framed full-screen hero, parallax interludes, mirrored layout. */
export function Grand({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const photos = ctx.gallery.length ? ctx.gallery : [ctx.hero];
  return (
    <div className="t-gr">
      <header className="gr-hero">
        <HeroImg ctx={ctx} w={2400} className="gr-hero-img" />
        <div className="gr-hero-shade" />
        <div className="gr-frame" aria-hidden />
        <div className="gr-hero-copy">
          <p className="k rise">{c.headline || "The wedding celebration of"}</p>
          <h1 className="gr-names d rise rise-2">
            {ctx.p1}
            <span className="s">&amp;</span>
            {ctx.p2}
          </h1>
          <p className="gr-date rise rise-3">
            {ctx.date}
            {c.location ? <span> · {c.location}</span> : null}
          </p>
          <Countdown date={c.date} className="gr-count rise rise-4" />
        </div>
      </header>

      <nav className="gr-nav">
        {ctx.sections.map((id) => (
          <a key={id} href={`#${id}`}>
            {title(ctx, id)}
          </a>
        ))}
      </nav>

      <Sections
        ctx={ctx}
        wrap={(id, i, content) => (
          <Fragment>
            {i > 0 && i % 3 === 0 && (
              <div className="gr-interlude" style={{ ["--band" as string]: `url("${img(photos[(i / 3) % photos.length], 2000)}")` }}>
                <p className="s">{INTERLUDES[(i / 3 - 1) % INTERLUDES.length]}</p>
              </div>
            )}
            <section id={id} className={`gr-sec gr-sec--${id}`}>
              <p className="gr-over s">{["Our", "The", "With", "For"][i % 4]}</p>
              <h2 className="gr-h d">{title(ctx, id)}</h2>
              <div className="gr-hair" />
              {content}
            </section>
          </Fragment>
        )}
        custom={{
          details: () => (
            <>
              <div className="gr-events">
                {events(c).map((e, i) => (
                  <Fragment key={i}>
                    {i === 1 && (
                      <div className="gr-amp s" aria-hidden>
                        &amp;
                      </div>
                    )}
                    <article className="gr-event">
                      <p className="k">{e.title}</p>
                      <p className="gr-event-time d">{e.time}</p>
                      <p className="gr-event-venue">{e.venue}</p>
                      <p className="m">{e.address}</p>
                      <DirectionsLink e={e} className="gr-btn" />
                    </article>
                  </Fragment>
                ))}
              </div>
              <div className="gr-center">
                <CalendarLink ctx={ctx} className="gr-btn gr-btn--solid" />
              </div>
              <MapEmbed ctx={ctx} className="gr-map" />
            </>
          ),
          schedule: () => (
            <ol className="gr-timeline">
              {c.schedule.items.map((it, i) => (
                <li key={i}>
                  <span className="gr-tl-time d">{it.time}</span>
                  <span className="gr-tl-dot" />
                  <span className="gr-tl-body">
                    <b>{it.title}</b>
                    <span className="m">{it.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          ),
          gallery: () => (
            <div className="gr-gallery gal-tpl">
              {ctx.gallery.map((src, i) => (
                <div key={i}>
                  <GalleryImg src={src} w={900} />
                </div>
              ))}
            </div>
          ),
        }}
      />

      <footer className="gr-foot">
        <HeroImg ctx={ctx} w={2000} className="gr-foot-img" />
        <div className="gr-hero-shade" />
        <div className="gr-foot-copy">
          <p className="s">With love,</p>
          <p className="d">
            {ctx.p1} &amp; {ctx.p2}
          </p>
        </div>
      </footer>
    </div>
  );
}
