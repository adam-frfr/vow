import "./editorial.css";
import { initials } from "@/lib/content";
import { CalendarLink, DirectionsLink, GalleryImg, HeroImg, MapEmbed, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { events, pad2, type Ctx } from "../ctx";

const BLURBS: Partial<Record<string, string>> = {
  story: "How it all began, in their own words",
  details: "Where to be and when to be there",
  schedule: "The run of show, hour by hour",
  party: "Meet the people standing beside them",
  gallery: "An exclusive photo portfolio",
  music: "The song on repeat",
  travel: "Getting there in style",
  dressCode: "What to wear",
  registry: "The gift guide",
  faq: "Your questions, answered",
  wishes: "Notes from friends",
  rsvp: "Reserve your seat",
};

/** Fashion magazine: cover with cover lines, contents page, feature story. */
export function Editorial({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const ini = initials(c);
  const month = ctx.date ? ctx.date.replace(/^\w+, /, "").replace(/ \d+,/, "") : "Special Edition";
  const paras = c.story.body.split(/\n{2,}/).filter(Boolean);
  const quote = paras[0]?.split(/(?<=[.!?])\s/)[0];
  const lines = ctx.sections.filter((id) => id !== "rsvp").slice(0, 3);
  return (
    <div className="t-ed">
      <nav className="ed-mast">
        <span className="ed-logo d">
          {ini[0]}
          <i className="s">&amp;</i>
          {ini[1]}
        </span>
        <span className="ed-issue">Issue Nº 01 · {month}</span>
        <span className="ed-links">
          {ctx.sections.slice(0, 4).map((id) => (
            <a key={id} href={`#${id}`}>
              {title(ctx, id)}
            </a>
          ))}
        </span>
      </nav>

      <header className="ed-cover">
        <HeroImg ctx={ctx} w={2200} className="ed-cover-img" />
        <div className="ed-cover-shade" />
        <h1 className="ed-names d rise">
          <span>{ctx.p1}</span>
          <span className="ed-amp s">&amp;</span>
          <span>{ctx.p2}</span>
        </h1>
        <ul className="ed-lines rise rise-2">
          {lines.map((id) => (
            <li key={id}>
              <b>{title(ctx, id)}</b>
              <span>{BLURBS[id]}</span>
            </li>
          ))}
        </ul>
        <div className="ed-cover-foot rise rise-3">
          <span className="ed-special">The Wedding Issue</span>
          <span>
            {ctx.date}
            {c.location ? ` · ${c.location}` : ""}
          </span>
        </div>
      </header>

      <section className="ed-toc">
        <div className="ed-toc-title">
          <h2 className="d">Contents</h2>
          <Countdown date={c.date} className="ed-count" />
        </div>
        <ol>
          {ctx.sections.map((id, i) => (
            <li key={id}>
              <a href={`#${id}`}>
                <span className="ed-pg d">{pad2(i * 4 + 6)}</span>
                <span>
                  <b>{title(ctx, id)}</b>
                  <span className="m">{BLURBS[id]}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <Sections
        ctx={ctx}
        wrap={(id, i, content) => (
          <section id={id} className={`ed-sec ed-sec--${id}`}>
            <header className="ed-head">
              <span className="ed-head-pg">p. {pad2(i * 4 + 6)}</span>
              <h2 className="d">{title(ctx, id)}</h2>
              <span className="ed-head-blurb">{BLURBS[id]}</span>
            </header>
            {content}
          </section>
        )}
        custom={{
          story: () => (
            <div className="ed-feature">
              <figure className="ed-feature-img">
                <GalleryImg src={ctx.gallery[0] ?? ctx.hero} w={1200} />
                <figcaption>Photographed for Issue Nº 01</figcaption>
              </figure>
              <div className="ed-feature-text">
                <p className="ed-kicker">Feature</p>
                <h3 className="d ed-feature-h">Love, unscripted.</h3>
                {quote && <blockquote className="ed-pull d">“{quote}”</blockquote>}
                <div className="ed-cols">
                  {paras.map((p, i) => (
                    <p key={i} className={i === 0 ? "ed-drop" : ""}>
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ),
          details: () => (
            <>
              <dl className="ed-spec">
                <div>
                  <dt>Date</dt>
                  <dd className="d">{ctx.date || "TBA"}</dd>
                </div>
                {events(c).map((e, i) => (
                  <div key={i}>
                    <dt>{e.title}</dt>
                    <dd>
                      <span className="d">{e.venue}</span>
                      <span className="ed-spec-meta">
                        {e.time}
                        {e.address ? ` · ${e.address}` : ""}
                      </span>
                      <DirectionsLink e={e} className="ed-link">
                        Directions →
                      </DirectionsLink>
                    </dd>
                  </div>
                ))}
                {c.location && (
                  <div>
                    <dt>City</dt>
                    <dd className="d">{c.location}</dd>
                  </div>
                )}
              </dl>
              <CalendarLink ctx={ctx} className="ed-link ed-cal">
                Add to calendar →
              </CalendarLink>
              <MapEmbed ctx={ctx} className="ed-map" />
            </>
          ),
          schedule: () => (
            <ol className="ed-run">
              {c.schedule.items.map((it, i) => (
                <li key={i}>
                  <span className="ed-run-no d">{pad2(i + 1)}</span>
                  <span className="ed-run-time">{it.time}</span>
                  <span className="ed-run-title d">{it.title}</span>
                  <span className="m">{it.detail}</span>
                </li>
              ))}
            </ol>
          ),
          gallery: () => (
            <div className="ed-bento">
              {ctx.gallery.map((src, i) => (
                <GalleryImg key={i} src={src} w={i % 5 === 0 ? 1400 : 800} />
              ))}
            </div>
          ),
        }}
      />

      <footer className="ed-back">
        <p className="ed-logo d">
          {ini[0]}
          <i className="s">&amp;</i>
          {ini[1]}
        </p>
        <p className="k m">The Wedding Issue · {ctx.date}</p>
      </footer>
    </div>
  );
}
