import "./cinematic.css";
import { CalendarLink, DirectionsLink, GalleryImg, HeroImg, MapEmbed, Prose, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { events, pad2, type Ctx } from "../ctx";

/** Film-premiere architecture: letterbox hero, opening credits, scenes, film strip. */
export function Cinematic({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const party = c.party.members.filter((m) => m.name).slice(0, 4);
  const year = c.date.slice(0, 4);
  return (
    <div className="t-cn">
      <header className="cn-hero">
        <div className="cn-bar cn-bar--top">
          <span>
            A {ctx.p1} &amp; {ctx.p2} Production
          </span>
          <span className="cn-rating">Rated L · for Love</span>
        </div>
        <div className="cn-screen">
          <HeroImg ctx={ctx} w={2200} />
          <div className="cn-grade" />
          <div className="cn-title rise">
            <p className="k">{c.headline || "Coming soon"}</p>
            <h1 className="d">
              {ctx.p1}
              <span className="s">&amp;</span>
              {ctx.p2}
            </h1>
          </div>
        </div>
        <div className="cn-bar cn-bar--bottom">
          <span>Premiering {ctx.date || "soon"}</span>
          <Countdown date={c.date} className="cn-count" labels={["D", "H", "M"]} />
          <span>{c.location || "Location TBA"}</span>
        </div>
      </header>

      <section className="cn-credits">
        <dl>
          <div>
            <dt>Starring</dt>
            <dd className="d">
              {ctx.p1}
              <br />
              {ctx.p2}
            </dd>
          </div>
          <div>
            <dt>Directed by</dt>
            <dd className="d">Fate</dd>
          </div>
          <div>
            <dt>Written by</dt>
            <dd className="d">The Two of Them</dd>
          </div>
          {party.length > 0 && (
            <div>
              <dt>Featuring</dt>
              <dd className="d">
                {party.map((m, i) => (
                  <span key={i}>
                    {m.name}
                    <br />
                  </span>
                ))}
              </dd>
            </div>
          )}
          <div>
            <dt>Filmed on location in</dt>
            <dd className="d">{c.location || "A secret location"}</dd>
          </div>
        </dl>
      </section>

      <Sections
        ctx={ctx}
        wrap={(id, i, content) => (
          <section id={id} className={`cn-scene cn-scene--${id}`}>
            <div className="cn-slate">
              <span>Scene {pad2(i + 1)}</span>
              <span>Take 1</span>
              <span>{year}</span>
            </div>
            <h2 className="d cn-h">{title(ctx, id)}</h2>
            <div className="cn-body">{content}</div>
          </section>
        )}
        custom={{
          story: () => (
            <div className="cn-plot">
              <p className="cn-plot-k">The Plot</p>
              <Prose text={c.story.body} />
            </div>
          ),
          details: () => (
            <>
              <div className="cn-venues">
                {events(c).map((e, i) => (
                  <article key={i} className="cn-venue">
                    <p className="cn-venue-k">{i === 0 ? "World Premiere" : "After-Party"}</p>
                    <h3 className="d">{e.venue || e.title}</h3>
                    <p className="cn-venue-time">{e.time}</p>
                    <p className="m">{e.address}</p>
                    <DirectionsLink e={e} className="cn-link">
                      Directions
                    </DirectionsLink>
                  </article>
                ))}
              </div>
              <div className="cn-center">
                <CalendarLink ctx={ctx} className="cn-link">
                  Save the premiere date
                </CalendarLink>
              </div>
              <MapEmbed ctx={ctx} className="cn-map" />
            </>
          ),
          schedule: () => (
            <div className="cn-showtimes">
              {c.schedule.items.map((it, i) => (
                <div key={i} className="cn-show">
                  <span className="cn-show-time d">{it.time}</span>
                  <span className="cn-show-title">{it.title}</span>
                  <span className="m">{it.detail}</span>
                </div>
              ))}
            </div>
          ),
          gallery: () => (
            <div className="cn-strip" tabIndex={0} aria-label="Film strip gallery, scroll sideways">
              {ctx.gallery.map((src, i) => (
                <figure key={i}>
                  <GalleryImg src={src} w={800} />
                  <figcaption>
                    {pad2(i + 1)}A · {year}
                  </figcaption>
                </figure>
              ))}
            </div>
          ),
        }}
      />

      <footer className="cn-end">
        <p className="s">The End</p>
        <p className="k">…is only the beginning</p>
      </footer>
    </div>
  );
}
