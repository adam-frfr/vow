import "./atelier.css";
import { initials } from "@/lib/content";
import { floralsOf, getFloral } from "@/lib/assets";
import { familyOf } from "@/lib/decor";
import { CalendarLink, DirectionsLink, GalleryImg, MapEmbed, Prose, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { FloralArt } from "../Decor";
import { events, type Ctx } from "../ctx";

/**
 * Watercolour Atelier: painted florals bloom onto paper. The names sit inside a
 * painted wreath; every section is a paper card crowned by a painted spray.
 */
export function Atelier({ ctx }: { ctx: Ctx }) {
  const { c, decor } = ctx;
  const ini = initials(c);
  const fam = familyOf(ctx.theme.palette.accent);
  const okTone = (id?: string) => {
    const f = getFloral(id);
    return f && !(ctx.dark && f.tone === "light") ? f : undefined;
  };
  const wreath = okTone(decor.heroFloral) ?? floralsOf("wreath")[0];
  const corner = okTone(decor.corner);
  const crown = okTone(decor.divider) ?? floralsOf("garland")[0];
  const bouquet =
    okTone(decor.scatter) ??
    floralsOf("bouquet").find((b) => b.tone === "any" && b.id.includes(fam === "purple" ? "purple" : fam === "red" ? "burgundy" : "pink")) ??
    floralsOf("bouquet")[0];

  return (
    <div className="t-at">
      <header className="at-hero">
        {corner && (
          <>
            <FloralArt floral={corner} ctx={ctx} className="at-corner at-corner--tl" origin="tl" auto />
            <FloralArt floral={corner} ctx={ctx} className="at-corner at-corner--br" origin="br" auto delay={600} />
          </>
        )}
        <p className="k at-kicker rise">{c.headline || "Together with their families"}</p>
        <div className="at-wreath">
          <FloralArt floral={wreath} ctx={ctx} className="at-wreath-art" origin="tr" auto delay={150} />
          <h1 className="at-names">
            <span className="d rise rise-2">{ctx.p1}</span>
            <span className="s at-and rise rise-3">&amp;</span>
            <span className="d rise rise-3">{ctx.p2}</span>
          </h1>
        </div>
        <p className="at-tag rise rise-4">{c.tagline}</p>
        <p className="s at-date">{ctx.date || "Date to be announced"}</p>
        {c.location && <p className="k m">{c.location}</p>}
        <Countdown date={c.date} className="at-count" />
        <nav className="at-nav">
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
        wrap={(id, i, content) => (
          <section id={id} className={`at-sec at-sec--${id}`}>
            <div className="at-card">
              {i % 3 === 0 && <FloralArt floral={crown} ctx={ctx} className="at-crown" origin={i % 2 ? "tl" : "tr"} />}
              <p className="at-sec-k">{["Chapter", "Notes", "Details", "Moments"][i % 4]}</p>
              <h2 className="s at-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={{
          story: () => (
            <div className="at-story">
              <FloralArt floral={bouquet} ctx={ctx} className="at-story-art" origin="bl" />
              <Prose text={c.story.body} className="at-story-text" />
            </div>
          ),
          details: () => (
            <>
              <div className="at-places">
                {events(c).map((e, i) => (
                  <article key={i} className="at-place">
                    <p className="k">{e.title}</p>
                    <p className="d at-place-time">{e.time}</p>
                    <p className="at-place-venue">{e.venue}</p>
                    <p className="m">{e.address}</p>
                    <DirectionsLink e={e} className="at-link" />
                  </article>
                ))}
              </div>
              <CalendarLink ctx={ctx} className="at-link at-cal" />
              <MapEmbed ctx={ctx} className="at-map" />
            </>
          ),
          schedule: () => (
            <ol className="at-sched">
              {c.schedule.items.map((it, i) => (
                <li key={i}>
                  <span className="d at-sched-title">{it.title}</span>
                  <span className="at-dots" />
                  <span className="at-sched-time">{it.time}</span>
                  {it.detail && <span className="m at-sched-detail">{it.detail}</span>}
                </li>
              ))}
            </ol>
          ),
          gallery: () => (
            <div className="at-gallery">
              {ctx.gallery.map((src, i) => (
                <GalleryImg key={i} src={src} w={700} />
              ))}
            </div>
          ),
        }}
      />

      <footer className="at-foot">
        <div className="at-wreath at-wreath--sm">
          <FloralArt floral={wreath} ctx={ctx} className="at-wreath-art" origin="bl" />
          <p className="d at-mono">
            {ini[0]}
            <span className="s">&amp;</span>
            {ini[1]}
          </p>
        </div>
        <p className="k m">With love, {ctx.date}</p>
      </footer>
    </div>
  );
}
