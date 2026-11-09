import "./scrapbook.css";
import { formatDate } from "@/lib/content";
import { CalendarLink, DirectionsLink, GalleryImg, MapEmbed, Prose, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { events, type Ctx } from "../ctx";

const CAPTIONS = ["the beginning", "adventures", "us, obviously", "best day", "partners in crime", "forever & ever", "favourite person", "home"];

/** Scrapbook: scattered polaroids, index cards, handwriting. */
export function Scrapbook({ ctx }: { ctx: Ctx }) {
  const { c, theme } = ctx;
  const shots = [ctx.hero, ...(ctx.heroIsTheme && theme.extras ? theme.extras : ctx.gallery.slice(0, 2))].slice(0, 3);
  return (
    <div className="t-sk">
      <header className="sk-hero">
        <div className="sk-board">
          {shots.map((s, i) => (
            <figure key={i} className={`sk-pol sk-pol--${i}`}>
              <GalleryImg src={s} w={700} eager />
              <figcaption className="s">{["us ♡", "save the date!", "can't wait"][i]}</figcaption>
            </figure>
          ))}
          <div className="sk-badge">
            <span>save the date</span>
            <b className="d">{c.date ? formatDate(c.date, "short").replace(/, \d{4}$/, "") : "soon"}</b>
            <span>{c.date.slice(0, 4)}</span>
          </div>
        </div>
        <div className="sk-title">
          <p className="sk-small">{c.headline || "guess what…"}</p>
          <h1 className="s">
            {ctx.p1} <span>&amp;</span> {ctx.p2}
          </h1>
          <p className="sk-small">are getting married{c.location ? ` in ${c.location}` : ""}!</p>
          <Countdown date={c.date} className="sk-count" labels={["days", "hours", "mins"]} />
        </div>
      </header>

      <Sections
        ctx={ctx}
        wrap={(id, i, content) => (
          <section id={id} className={`sk-sec sk-sec--${id}`}>
            <h2 className={`s sk-h sk-h--${i % 2}`}>{title(ctx, id)}</h2>
            {content}
          </section>
        )}
        custom={{
          story: () => (
            <div className="sk-note">
              <Prose text={c.story.body} />
              <p className="s sk-sign">
                — {ctx.p1} &amp; {ctx.p2}
              </p>
            </div>
          ),
          details: () => (
            <>
              <div className="sk-cards">
                {events(c).map((e, i) => (
                  <article key={i} className={`sk-card sk-card--${i}`}>
                    <p className="sk-card-k">{e.title}</p>
                    <p className="d sk-card-time">{e.time}</p>
                    <p className="sk-card-venue">{e.venue}</p>
                    <p className="m">{e.address}</p>
                    <DirectionsLink e={e} className="sk-btn">
                      how to get there
                    </DirectionsLink>
                  </article>
                ))}
              </div>
              <div className="sk-center">
                <CalendarLink ctx={ctx} className="sk-btn">
                  add it to your calendar ♡
                </CalendarLink>
              </div>
              <MapEmbed ctx={ctx} className="sk-map" />
            </>
          ),
          schedule: () => (
            <div className="sk-tickets" tabIndex={0}>
              {c.schedule.items.map((it, i) => (
                <div key={i} className="sk-ticket">
                  <span className="sk-ticket-time d">{it.time}</span>
                  <span className="sk-ticket-title">{it.title}</span>
                  <span className="m">{it.detail}</span>
                </div>
              ))}
            </div>
          ),
          gallery: () => (
            <div className="sk-wall">
              {ctx.gallery.map((src, i) => (
                <figure key={i} className="sk-pol">
                  <GalleryImg src={src} w={600} />
                  <figcaption className="s">{CAPTIONS[i % CAPTIONS.length]}</figcaption>
                </figure>
              ))}
            </div>
          ),
        }}
      />

      <footer className="sk-foot">
        <p className="s">see you there! xo</p>
      </footer>
    </div>
  );
}
