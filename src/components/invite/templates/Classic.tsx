import "./classic.css";
import { formalDate, formalTime, initials } from "@/lib/content";
import { CalendarLink, DirectionsLink, GalleryImg, HeroImg, MapEmbed, Prose, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { events, type Ctx } from "../ctx";

/** Traditional formal invitation: monogram, arch portrait, formal wording, mirrored timeline. */
export function Classic({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const fd = formalDate(c.date);
  const ini = initials(c);
  const ceremony = events(c)[0];
  return (
    <div className="t-cl">
      <header className="cl-top">
        <div className="cl-mono">
          <span className="d">{ini[0]}</span>
          <span className="s">&amp;</span>
          <span className="d">{ini[1]}</span>
        </div>
        <nav className="cl-nav">
          {ctx.sections.map((id) => (
            <a key={id} href={`#${id}`}>
              {title(ctx, id)}
            </a>
          ))}
        </nav>
      </header>

      <section className="cl-hero">
        <div className="cl-arch rise">
          <HeroImg ctx={ctx} w={1100} />
        </div>
        <div className="cl-invite rise rise-2">
          <p className="cl-host">{c.headline || "Together with their families"}</p>
          <h1 className="cl-names">
            <span className="d">{ctx.p1}</span>
            <span className="s cl-and">and</span>
            <span className="d">{ctx.p2}</span>
          </h1>
          <p className="cl-req">{c.tagline || "request the pleasure of your company at the celebration of their marriage"}</p>
          <div className="cl-when">
            {fd ? (
              <>
                <p>{fd.weekday}</p>
                <p className="d cl-day">{fd.line}</p>
                <p>{fd.year}</p>
                {ceremony?.time && <p className="m">at {formalTime(ceremony.time)}</p>}
              </>
            ) : (
              <p>Date to be announced</p>
            )}
          </div>
          {ceremony?.venue && <p className="cl-where">{ceremony.venue}</p>}
          {c.location && <p className="cl-city">{c.location}</p>}
          <Countdown date={c.date} className="cl-count" />
        </div>
      </section>

      <Sections
        ctx={ctx}
        wrap={(id, _i, content) => (
          <section id={id} className={`cl-sec cl-sec--${id}`}>
            <h2 className="d cl-h">{title(ctx, id)}</h2>
            <div className="cl-orn" aria-hidden>
              <span />
              <i className="s">{ini[0]}&amp;{ini[1]}</i>
              <span />
            </div>
            {content}
          </section>
        )}
        custom={{
          story: () => (
            <div className="cl-story">
              <div className="cl-arch cl-arch--sm">
                <GalleryImg src={ctx.gallery[0] ?? ctx.hero} w={800} />
              </div>
              <Prose className="cl-drop" text={c.story.body} />
            </div>
          ),
          details: () => (
            <>
              <div className="cl-events">
                {events(c).map((e, i) => (
                  <article key={i} className="cl-event">
                    <p className="k">{e.title}</p>
                    <p className="d cl-event-time">{e.time}</p>
                    <p className="cl-event-venue">{e.venue}</p>
                    <p className="m">{e.address}</p>
                    <DirectionsLink e={e} className="cl-link" />
                  </article>
                ))}
              </div>
              <div className="cl-center">
                <CalendarLink ctx={ctx} className="cl-link" />
              </div>
              <MapEmbed ctx={ctx} className="cl-map" />
            </>
          ),
          schedule: () => (
            <ol className="cl-timeline">
              {c.schedule.items.map((it, i) => (
                <li key={i}>
                  <div className="cl-tl-card">
                    <p className="cl-tl-time">{it.time}</p>
                    <p className="d cl-tl-title">{it.title}</p>
                    <p className="m">{it.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          ),
          gallery: () => (
            <div className="cl-grid gal-tpl">
              {ctx.gallery.map((src, i) => (
                <div key={i} className="cl-grid-item">
                  <GalleryImg src={src} w={700} />
                </div>
              ))}
            </div>
          ),
        }}
      />

      <footer className="cl-foot">
        <div className="cl-mono cl-mono--lg">
          <span className="d">{ini[0]}</span>
          <span className="s">&amp;</span>
          <span className="d">{ini[1]}</span>
        </div>
        <p className="k m">{ctx.date}</p>
      </footer>
    </div>
  );
}
