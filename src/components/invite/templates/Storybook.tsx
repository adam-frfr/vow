import "./storybook.css";
import { CalendarLink, DirectionsLink, GalleryImg, HeroImg, MapEmbed, Prose, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { events, WORDS, type Ctx } from "../ctx";

/** Picture-book architecture: book cover, contents page, chapters, "The End". */
export function Storybook({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const year = c.date.slice(0, 4);
  return (
    <div className="t-sb">
      <header className="sb-cover">
        <p className="k sb-series rise">A love story · Volume One</p>
        <div className="sb-illo rise rise-2">
          <HeroImg ctx={ctx} w={1400} />
        </div>
        <h1 className="sb-title rise rise-3">
          <span className="sb-the">The Tale of</span>
          <span className="d">{ctx.p1}</span>
          <span className="s sb-amp">&amp;</span>
          <span className="d">{ctx.p2}</span>
        </h1>
        <p className="sb-byline rise rise-4">
          Written by fate · Illustrated by {year ? `the year ${year}` : "time"}
        </p>
        <p className="sb-date">{ctx.date}</p>
        <Countdown date={c.date} className="sb-count" labels={["sleeps", "hours", "minutes"]} />
      </header>

      <nav className="sb-contents" aria-label="Contents">
        <h2 className="d">Contents</h2>
        <ol>
          {ctx.sections.map((id, i) => (
            <li key={id}>
              <a href={`#${id}`}>
                <span className="sb-ch">Chapter {WORDS[i]}</span>
                <span className="sb-dots" />
                <span>{title(ctx, id)}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Sections
        ctx={ctx}
        wrap={(id, i, content) => (
          <section id={id} className={`sb-chapter sb-chapter--${id}`}>
            <p className="sb-ch-no">Chapter {WORDS[i]}</p>
            <h2 className="d sb-ch-title">{title(ctx, id)}</h2>
            <p className="sb-asterism" aria-hidden>
              * * *
            </p>
            <div className="sb-page">{content}</div>
          </section>
        )}
        custom={{
          story: () => <Prose className="sb-drop" text={c.story.body} />,
          details: () => (
            <>
              <div className="sb-spread">
                {events(c).map((e, i) => (
                  <article key={i} className="sb-leaf">
                    <p className="sb-leaf-k">{i === 0 ? "Where it happens" : "And afterwards"}</p>
                    <h3 className="d">{e.title}</h3>
                    <p className="sb-leaf-time">{e.time}</p>
                    <p>{e.venue}</p>
                    <p className="m">{e.address}</p>
                    <DirectionsLink e={e} className="sb-btn">
                      Find the way
                    </DirectionsLink>
                  </article>
                ))}
              </div>
              <div className="sb-center">
                <CalendarLink ctx={ctx} className="sb-btn">
                  Mark your calendar
                </CalendarLink>
              </div>
              <MapEmbed ctx={ctx} className="sb-map" />
            </>
          ),
          schedule: () => (
            <ol className="sb-steps">
              {c.schedule.items.map((it, i) => (
                <li key={i}>
                  <span className="sb-step-no d">{i + 1}</span>
                  <div>
                    <p className="sb-step-time">{it.time}</p>
                    <p className="d sb-step-title">{it.title}</p>
                    <p className="m">{it.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          ),
          gallery: () => (
            <div className="sb-pics gal-tpl">
              {ctx.gallery.map((src, i) => (
                <GalleryImg key={i} src={src} w={700} />
              ))}
            </div>
          ),
        }}
      />

      <footer className="sb-end">
        <p className="s">The End</p>
        <p className="sb-end-sub">…and they lived happily ever after.</p>
        <div className="sb-end-illo">
          <HeroImg ctx={ctx} w={600} />
        </div>
      </footer>
    </div>
  );
}
