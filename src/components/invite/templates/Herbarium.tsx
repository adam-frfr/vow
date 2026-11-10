import "./herbarium.css";
import { formatDate } from "@/lib/content";
import { ALL_FLORALS, floralUrl, getFloral, type Floral } from "@/lib/assets";
import { familyOf, floralFamilies } from "@/lib/decor";
import { CalendarLink, DirectionsLink, GalleryImg, MapEmbed, Prose, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { FloralArt } from "../Decor";
import { events, type Ctx } from "../ctx";

const idOf = (u: string) => u.match(/\/(?:library|florals)\/([a-z0-9-]+)\.webp$/)?.[1];

/** Playful botanical "Latin" for each plate, so the labels read like a real herbarium. */
const SPECIES = ["Amor perpetuus", "Rosa promissa", "Fides aeterna", "Cor unitum", "Flos nuptialis", "Gaudium commune", "Spes florens", "Domus nova"];

/**
 * Herbarium: the wedding as a pressed-flower collection. Each section is a
 * specimen sheet on old paper, with a painted stem and a museum label.
 */
export function Herbarium({ ctx }: { ctx: Ctx }) {
  const { c, decor } = ctx;
  const fam = familyOf(ctx.theme.palette.accent);
  const extras = (ctx.theme.extras ?? []).map(idOf).map((id) => getFloral(id)).filter((f): f is Floral => !!f);
  const paper = extras.find((f) => f.kind === "texture") ?? getFloral("cream-paper");
  const usable = (f: Floral) => (f.kind === "bouquet" || f.kind === "elements") && !(ctx.dark && f.tone === "light" && !decor.finish);
  let specimens = extras.filter(usable);
  if (specimens.length < 3) specimens = [...specimens, ...ALL_FLORALS.filter((f) => usable(f) && floralFamilies(f).includes(fam))].slice(0, 8);
  if (specimens.length === 0) specimens = ALL_FLORALS.filter(usable).slice(0, 6);
  const hero = getFloral(decor.heroFloral) ?? specimens[0];
  const collected = c.date ? formatDate(c.date) : "to be announced";

  return (
    <div className="t-hb" style={paper ? { ["--paper-img" as string]: `url("${floralUrl(paper.id)}")` } : undefined}>
      <header className="hb-hero">
        <div className="hb-sheet hb-sheet--hero">
          <div className="hb-hero-art">
            <FloralArt floral={hero} ctx={ctx} className="hb-specimen" origin="bl" auto delay={150} />
          </div>
          <div className="hb-hero-text">
            <p className="hb-k rise">Herbarium of</p>
            <h1 className="hb-names rise rise-2">
              <span className="d">{ctx.p1}</span>
              <span className="s hb-and">&amp;</span>
              <span className="d">{ctx.p2}</span>
            </h1>
            <p className="hb-tag rise rise-3">{c.tagline || "invite you to celebrate their wedding"}</p>
            <dl className="hb-label rise rise-4">
              <div>
                <dt>Specimen</dt>
                <dd>
                  <i>{SPECIES[0]}</i>
                </dd>
              </div>
              <div>
                <dt>Collected</dt>
                <dd>{collected}</dd>
              </div>
              {c.location && (
                <div>
                  <dt>Locality</dt>
                  <dd>{c.location}</dd>
                </div>
              )}
              <div>
                <dt>Collectors</dt>
                <dd>{c.headline || "Together with their families"}</dd>
              </div>
            </dl>
            <Countdown date={c.date} className="hb-count" />
          </div>
        </div>
        <nav className="hb-nav">
          {ctx.sections.map((id, i) => (
            <a key={id} href={`#${id}`}>
              <span>Pl. {i + 1}</span> {title(ctx, id)}
            </a>
          ))}
        </nav>
      </header>

      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => {
          const sp = specimens[(i + 1) % specimens.length];
          return (
            <section id={id} className={`hb-sec hb-sec--${id} ${i % 2 ? "hb-sec--flip" : ""}`}>
              <div className="hb-sheet">
                <div className="hb-plate-art">
                  <FloralArt floral={sp} ctx={ctx} className="hb-specimen" origin={i % 2 ? "br" : "bl"} />
                </div>
                <div className="hb-plate-body">
                  <h2 className="d hb-h">{title(ctx, id)}</h2>
                  {content}
                </div>
                <dl className="hb-label hb-label--plate">
                  <div>
                    <dt>Plate</dt>
                    <dd>{String(i + 1).padStart(2, "0")}</dd>
                  </div>
                  <div>
                    <dt>Specimen</dt>
                    <dd>
                      <i>{SPECIES[(i + 1) % SPECIES.length]}</i>
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
          );
        }}
        custom={{
          story: () => <Prose text={c.story.body} className="hb-prose" />,
          details: () => (
            <>
              <div className="hb-events">
                {events(c).map((e, i) => (
                  <article key={i}>
                    <p className="hb-k">{e.title}</p>
                    <p className="d hb-event-time">{e.time}</p>
                    <p>{e.venue}</p>
                    <p className="m">{e.address}</p>
                    <DirectionsLink e={e} className="hb-link" />
                  </article>
                ))}
              </div>
              <CalendarLink ctx={ctx} className="hb-link" />
              <MapEmbed ctx={ctx} className="hb-map" />
            </>
          ),
          gallery: () => (
            <div className="hb-gallery">
              {ctx.gallery.map((src, i) => (
                <figure key={i}>
                  <GalleryImg src={src} w={600} />
                  <figcaption>fig. {i + 1}</figcaption>
                </figure>
              ))}
            </div>
          ),
        }}
      />

      <footer className="hb-foot">
        <dl className="hb-label">
          <div>
            <dt>Collection</dt>
            <dd>
              {ctx.p1} &amp; {ctx.p2}
            </dd>
          </div>
          <div>
            <dt>Pressed</dt>
            <dd>{collected}</dd>
          </div>
        </dl>
      </footer>
    </div>
  );
}
