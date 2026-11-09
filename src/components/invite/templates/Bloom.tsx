import "./bloom.css";
import { CalendarLink, DirectionsLink, GalleryImg, MapEmbed, Prose, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { events, pad2, type Ctx } from "../ctx";
import { BloomShell } from "./BloomShell";

const KICKERS = ["Rooted", "Growing", "Reaching", "Opening", "Blooming", "Flourishing", "Abundant", "Evergreen", "Seeding", "Wild", "Golden", "Forever"];

/** Garden Bloom: the story scrolls beside a real flower that opens as you read. */
export function Bloom({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const flower = ctx.decor.cutout && ["dandelion", "orchid", "daffodil"].includes(ctx.decor.cutout) ? ctx.decor.cutout : "dandelion";
  return (
    <div className="t-bl">
      <BloomShell cutoutId={flower} names={`${ctx.p1} & ${ctx.p2}`}>
        <header className="bl-hero">
          <p className="k bl-k rise">{c.headline || "Together with their families"}</p>
          <h1 className="bl-names d rise rise-2">
            <span>{ctx.p1}</span>
            <span className="s">&amp;</span>
            <span>{ctx.p2}</span>
          </h1>
          <p className="bl-tag rise rise-3">{c.tagline}</p>
          <div className="bl-when rise rise-4">
            <p className="d">{ctx.date || "Date to be announced"}</p>
            {c.location && <p className="k m">{c.location}</p>}
          </div>
          <Countdown date={c.date} className="bl-count" />
          <p className="bl-scroll k m">Scroll, and watch it grow</p>
        </header>

        <Sections
          ctx={ctx}
          cutout={false}
          wrap={(id, i, content) => (
            <section id={id} className={`bl-sec bl-sec--${id}`}>
              <div className="bl-head">
                <span className="bl-no">{pad2(i + 1)}</span>
                <span className="bl-kick">{KICKERS[i % KICKERS.length]}</span>
              </div>
              <h2 className="d bl-h">{title(ctx, id)}</h2>
              {content}
            </section>
          )}
          custom={{
            story: () => <Prose text={c.story.body} className="bl-story" />,
            details: () => (
              <>
                {events(c).map((e, i) => (
                  <article key={i} className="bl-event">
                    <div>
                      <p className="bl-event-k">{e.title}</p>
                      <p className="d bl-event-venue">{e.venue}</p>
                      <p className="m">{e.address}</p>
                    </div>
                    <div className="bl-event-side">
                      <p className="d bl-event-time">{e.time}</p>
                      <DirectionsLink e={e} className="bl-link" />
                    </div>
                  </article>
                ))}
                <CalendarLink ctx={ctx} className="bl-link bl-cal" />
                <MapEmbed ctx={ctx} className="bl-map" />
              </>
            ),
            schedule: () => (
              <ol className="bl-sched">
                {c.schedule.items.map((it, i) => (
                  <li key={i}>
                    <span className="bl-sched-time">{it.time}</span>
                    <span className="d bl-sched-title">{it.title}</span>
                    <span className="m">{it.detail}</span>
                  </li>
                ))}
              </ol>
            ),
            gallery: () => (
              <div className="bl-gallery gal-tpl">
                {ctx.gallery.map((src, i) => (
                  <GalleryImg key={i} src={src} w={700} />
                ))}
              </div>
            ),
          }}
        />

        <footer className="bl-foot">
          <p className="s">in full bloom</p>
          <p className="k m">
            {ctx.p1} &amp; {ctx.p2} · {ctx.date}
          </p>
        </footer>
      </BloomShell>
    </div>
  );
}
