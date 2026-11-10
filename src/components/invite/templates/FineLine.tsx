import "./fineline.css";
import { formalTime, initials } from "@/lib/content";
import { floralsOf, getFloral } from "@/lib/assets";
import { CalendarLink, DirectionsLink, GalleryImg, MapEmbed, Prose, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { FloralArt } from "../Decor";
import { events, type Ctx } from "../ctx";

/**
 * Fine Line: a letterpress invitation come to life. Painted art is printed as
 * fine line work (white ink, gold foil or black ink); the hero is the card
 * itself, and every section is another card from the suite.
 */
export function FineLine({ ctx }: { ctx: Ctx }) {
  const { c, decor } = ctx;
  const ini = initials(c);
  const wreath = getFloral(decor.heroFloral) ?? floralsOf("wreath")[0];
  const sprig = getFloral(decor.corner);
  const rule = getFloral(decor.divider);
  const [d, m, y] = /^\d{4}-\d{2}-\d{2}$/.test(c.date) ? [c.date.slice(8), c.date.slice(5, 7), c.date.slice(0, 4)] : ["", "", ""];
  const month = m ? new Date(Date.UTC(2000, Number(m) - 1, 1)).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }) : "";
  const ceremony = events(c)[0];

  return (
    <div className="t-fl">
      <header className="fl-hero">
        <div className="fl-suite">
          <div className="fl-card fl-card--back rise" aria-hidden>
            <p className="s">{ini[0]}&amp;{ini[1]}</p>
          </div>
          <article className="fl-card fl-card--main rise rise-2">
            <FloralArt floral={wreath} ctx={ctx} className="fl-wreath" origin="tr" auto delay={200} />
            <div className="fl-card-text">
              <p className="fl-small">{(c.headline || "together with their families").toLowerCase()}</p>
              <h1 className="fl-names">
                <span className="s">{ctx.p1}</span>
                <span className="fl-and">and</span>
                <span className="s">{ctx.p2}</span>
              </h1>
              <p className="fl-small">{c.tagline || "joyfully invite you to their wedding"}</p>
              {d ? (
                <p className="fl-date">
                  <span>{month}</span>
                  <i />
                  <span>{d}</span>
                  <i />
                  <span>{y}</span>
                </p>
              ) : (
                <p className="fl-date">Date to be announced</p>
              )}
              {ceremony?.venue && <p className="fl-venue">{ceremony.venue}</p>}
              {c.location && <p className="fl-small">{c.location}</p>}
              {ceremony?.time && <p className="fl-small">at {formalTime(ceremony.time)}</p>}
            </div>
          </article>
          {sprig && <FloralArt floral={sprig} ctx={ctx} className="fl-sprig" origin="tr" auto delay={900} />}
        </div>
        <Countdown date={c.date} className="fl-count" />
        <nav className="fl-nav">
          {ctx.sections.map((id) => (
            <a key={id} href={`#${id}`}>
              {title(ctx, id)}
            </a>
          ))}
        </nav>
      </header>

      <Sections
        ctx={ctx}
        dividers={false}
        decor={false}
        wrap={(id, i, content) => (
          <section id={id} className={`fl-sec fl-sec--${id} ${i % 2 ? "fl-sec--alt" : ""}`}>
            <div className="fl-panel">
              {rule ? <FloralArt floral={rule} ctx={ctx} className="fl-rule" origin={i % 2 ? "tl" : "tr"} /> : <span className="fl-line" aria-hidden />}
              <p className="fl-no">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="s fl-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={{
          story: () => <Prose text={c.story.body} className="fl-prose" />,
          details: () => (
            <>
              <div className="fl-events">
                {events(c).map((e, i) => (
                  <article key={i} className="fl-event">
                    <p className="fl-venue">{e.title}</p>
                    {e.time && <p className="fl-small">at {formalTime(e.time)}</p>}
                    <p className="d fl-event-venue">{e.venue}</p>
                    <p className="fl-small">{e.address}</p>
                    <DirectionsLink e={e} className="fl-link" />
                  </article>
                ))}
              </div>
              <CalendarLink ctx={ctx} className="fl-link" />
              <MapEmbed ctx={ctx} className="fl-map" />
            </>
          ),
          schedule: () => (
            <ol className="fl-sched">
              {c.schedule.items.map((it, i) => (
                <li key={i}>
                  <span className="fl-sched-time">{it.time}</span>
                  <span className="d">{it.title}</span>
                  {it.detail && <span className="fl-small">{it.detail}</span>}
                </li>
              ))}
            </ol>
          ),
          gallery: () => (
            <div className="fl-gallery">
              {ctx.gallery.map((src, i) => (
                <GalleryImg key={i} src={src} w={700} />
              ))}
            </div>
          ),
        }}
      />

      <footer className="fl-foot">
        <div className="fl-foot-mark">
          <FloralArt floral={wreath} ctx={ctx} className="fl-foot-wreath" origin="bl" />
          <p className="s fl-mono">
            {ini[0]}&amp;{ini[1]}
          </p>
        </div>
        <p className="fl-small">{ctx.date}</p>
      </footer>
    </div>
  );
}
