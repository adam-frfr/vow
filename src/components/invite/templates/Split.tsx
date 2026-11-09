import "./split.css";
import { CalendarLink, Credit, DirectionsLink, GalleryImg, HeroImg, MapEmbed, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { events, pad2, type Ctx } from "../ctx";

/** Split screen: the photograph stays fixed on one side while the story scrolls. */
export function Split({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  return (
    <div className="t-sp">
      <aside className="sp-fixed">
        <HeroImg ctx={ctx} w={1600} className="sp-img" />
        <div className="sp-fixed-shade" />
        <div className="sp-fixed-copy">
          <p className="s">
            {ctx.p1} &amp; {ctx.p2}
          </p>
          <p className="k">{ctx.date}</p>
          <Credit ctx={ctx} className="sp-credit" />
        </div>
      </aside>

      <main className="sp-scroll">
        <header className="sp-intro">
          <p className="k m rise">{c.headline}</p>
          <h1 className="d rise rise-2">
            {ctx.p1}
            <br />
            <span className="s">&amp;</span> {ctx.p2}
          </h1>
          <p className="sp-tag rise rise-3">{c.tagline}</p>
          <div className="sp-when rise rise-4">
            <span>{ctx.date || "Date to be announced"}</span>
            {c.location && <span>{c.location}</span>}
          </div>
          <Countdown date={c.date} className="sp-count" />
          <nav className="sp-nav">
            {ctx.sections.map((id, i) => (
              <a key={id} href={`#${id}`}>
                <span>{pad2(i + 1)}</span>
                {title(ctx, id)}
              </a>
            ))}
          </nav>
        </header>

        <Sections
          ctx={ctx}
          wrap={(id, i, content) => (
            <section id={id} className={`sp-sec sp-sec--${id}`}>
              <p className="sp-no">{pad2(i + 1)}</p>
              <h2 className="d">{title(ctx, id)}</h2>
              {content}
            </section>
          )}
          custom={{
            details: () => (
              <>
                {events(c).map((e, i) => (
                  <article key={i} className="sp-event">
                    <div>
                      <p className="sp-event-k">{e.title}</p>
                      <p className="d sp-event-venue">{e.venue}</p>
                      <p className="m">{e.address}</p>
                    </div>
                    <div className="sp-event-side">
                      <p className="d sp-event-time">{e.time}</p>
                      <DirectionsLink e={e} className="sp-link">
                        Directions
                      </DirectionsLink>
                    </div>
                  </article>
                ))}
                <CalendarLink ctx={ctx} className="sp-link sp-cal" />
                <MapEmbed ctx={ctx} className="sp-map" />
              </>
            ),
            gallery: () => (
              <div className="sp-gallery">
                {ctx.gallery.map((src, i) => (
                  <GalleryImg key={i} src={src} w={700} />
                ))}
              </div>
            ),
          }}
        />
      </main>
    </div>
  );
}
