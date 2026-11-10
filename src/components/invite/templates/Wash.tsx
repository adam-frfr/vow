import "./wash.css";
import { initials } from "@/lib/content";
import { ALL_FLORALS, floralUrl, getFloral, type Floral } from "@/lib/assets";
import { familyOf, floralFamilies } from "@/lib/decor";
import { CalendarLink, DirectionsLink, GalleryImg, MapEmbed, Prose, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { FloralArt } from "../Decor";
import { events, type Ctx } from "../ctx";

const idOf = (u: string) => u.match(/\/(?:library|florals)\/([a-z0-9-]+)\.webp$/)?.[1];

/**
 * Watercolour Wash: every chapter floats on its own full-bleed watercolour
 * wash, on a paper panel that a painted bouquet spills over.
 */
export function Wash({ ctx }: { ctx: Ctx }) {
  const { c, decor } = ctx;
  const ini = initials(c);
  const fam = familyOf(ctx.theme.palette.accent);
  const extras = (ctx.theme.extras ?? []).map(idOf).map((id) => getFloral(id)).filter((f): f is Floral => !!f);
  let washes = extras.filter((f) => f.kind === "texture");
  if (washes.length === 0) washes = ALL_FLORALS.filter((f) => f.kind === "texture").slice(0, 3);
  const usable = (f: Floral) => (f.kind === "bouquet" || f.kind === "corner") && f.tone === "any";
  let blooms = extras.filter(usable);
  if (blooms.length < 3) blooms = [...blooms, ...ALL_FLORALS.filter((f) => usable(f) && floralFamilies(f).includes(fam))].slice(0, 6);
  if (blooms.length === 0) blooms = ALL_FLORALS.filter(usable).slice(0, 4);
  const hero = getFloral(decor.heroFloral) ?? blooms[0];
  const wash = (i: number) => ({ backgroundImage: `url("${floralUrl(washes[i % washes.length].id)}")` });

  return (
    <div className="t-wa">
      <header className="wa-hero" style={wash(0)}>
        <div className="wa-hero-panel">
          <p className="k wa-k rise">{c.headline || "Together with their families"}</p>
          <h1 className="wa-names rise rise-2">
            <span className="s">{ctx.p1}</span>
            <span className="d wa-and">and</span>
            <span className="s">{ctx.p2}</span>
          </h1>
          <p className="wa-tag rise rise-3">{c.tagline}</p>
          <p className="d wa-date rise rise-4">{ctx.date || "Date to be announced"}</p>
          {c.location && <p className="k m">{c.location}</p>}
          <Countdown date={c.date} className="wa-count" />
          <FloralArt floral={hero} ctx={ctx} className="wa-hero-bloom" origin="br" auto delay={300} />
        </div>
        <nav className="wa-nav">
          {ctx.sections.map((id) => (
            <a key={id} href={`#${id}`}>
              {title(ctx, id)}
            </a>
          ))}
        </nav>
      </header>

      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className={`wa-sec wa-sec--${id} ${i % 2 ? "wa-sec--right" : ""}`} style={wash(i + 1)}>
            <div className="wa-panel">
              {i % 2 === 0 && <FloralArt floral={blooms[(i + 1) % blooms.length]} ctx={ctx} className="wa-bloom" origin={i % 4 ? "tl" : "tr"} />}
              <h2 className="s wa-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={{
          story: () => <Prose text={c.story.body} className="wa-prose" />,
          details: () => (
            <>
              <div className="wa-events">
                {events(c).map((e, i) => (
                  <article key={i}>
                    <p className="k">{e.title}</p>
                    <p className="d wa-event-time">{e.time}</p>
                    <p>{e.venue}</p>
                    <p className="m">{e.address}</p>
                    <DirectionsLink e={e} className="wa-link" />
                  </article>
                ))}
              </div>
              <CalendarLink ctx={ctx} className="wa-link" />
              <MapEmbed ctx={ctx} className="wa-map" />
            </>
          ),
          gallery: () => (
            <div className="wa-gallery">
              {ctx.gallery.map((src, i) => (
                <GalleryImg key={i} src={src} w={700} />
              ))}
            </div>
          ),
        }}
      />

      <footer className="wa-foot" style={wash(0)}>
        <p className="s wa-mono">
          {ini[0]} &amp; {ini[1]}
        </p>
        <p className="k">{ctx.date}</p>
      </footer>
    </div>
  );
}
