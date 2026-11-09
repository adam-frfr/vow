import "./swiss.css";
import { CalendarLink, DirectionsLink, GalleryImg, HeroImg, MapEmbed, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { events, pad2, type Ctx } from "../ctx";

/** International Typographic Style: strict grid, numbered index, huge type. */
export function Swiss({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const [y, m, d] = c.date.split("-");
  return (
    <div className="t-sw">
      <nav className="sw-nav">
        <span>
          {ctx.p1} + {ctx.p2}
        </span>
        <span className="sw-nav-index">
          {ctx.sections.map((id, i) => (
            <a key={id} href={`#${id}`}>
              {pad2(i + 1)}
            </a>
          ))}
        </span>
      </nav>

      <header className="sw-hero">
        <h1 className="sw-names d">
          <span className="rise">{ctx.p1}</span>
          <span className="sw-plus rise rise-2">+</span>
          <span className="rise rise-3">{ctx.p2}</span>
        </h1>
        <div className="sw-photo">
          <HeroImg ctx={ctx} w={1200} />
        </div>
        <div className="sw-meta">
          <div className="sw-date d">
            {d ? (
              <>
                {d}.{m}.<br />
                {y}
              </>
            ) : (
              "TBA"
            )}
          </div>
          <dl className="sw-facts">
            <div>
              <dt>Place</dt>
              <dd>{c.location || "—"}</dd>
            </div>
            <div>
              <dt>Occasion</dt>
              <dd>Wedding</dd>
            </div>
            <div>
              <dt>Index</dt>
              <dd>
                01–{pad2(ctx.sections.length)}
              </dd>
            </div>
          </dl>
          <Countdown date={c.date} className="sw-count" labels={["D", "H", "M"]} />
        </div>
      </header>

      <Sections
        ctx={ctx}
        wrap={(id, i, content) => (
          <section id={id} className={`sw-sec sw-sec--${id}`}>
            <div className="sw-label">
              <span className="sw-no d">{pad2(i + 1)}</span>
              <h2>{title(ctx, id)}</h2>
            </div>
            <div className="sw-body">{content}</div>
          </section>
        )}
        custom={{
          details: () => (
            <>
              <table className="sw-table">
                <tbody>
                  {events(c).map((e, i) => (
                    <tr key={i}>
                      <th>{e.title}</th>
                      <td className="d sw-t-time">{e.time}</td>
                      <td>
                        {e.venue}
                        <br />
                        <span className="m">{e.address}</span>
                      </td>
                      <td>
                        <DirectionsLink e={e} className="sw-link">
                          Map ↗
                        </DirectionsLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <CalendarLink ctx={ctx} className="sw-link sw-cal">
                Calendar (.ics) ↓
              </CalendarLink>
              <MapEmbed ctx={ctx} className="sw-map" />
            </>
          ),
          schedule: () => (
            <ol className="sw-sched">
              {c.schedule.items.map((it, i) => (
                <li key={i}>
                  <span className="sw-s-time d">{it.time}</span>
                  <span className="sw-s-title">{it.title}</span>
                  <span className="m">{it.detail}</span>
                </li>
              ))}
            </ol>
          ),
          gallery: () => (
            <div className="sw-grid">
              {ctx.gallery.map((src, i) => (
                <figure key={i}>
                  <GalleryImg src={src} w={700} />
                  <figcaption>{pad2(i + 1)}</figcaption>
                </figure>
              ))}
            </div>
          ),
        }}
      />

      <footer className="sw-foot">
        <span className="d">
          {ctx.p1} + {ctx.p2}
        </span>
        <span>{ctx.date}</span>
      </footer>
    </div>
  );
}
