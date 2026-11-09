/* eslint-disable @next/next/no-img-element */
import "./botanical.css";
import { img } from "@/lib/themes";
import { CalendarLink, DirectionsLink, MapEmbed, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { events, ROMAN, type Ctx } from "../ctx";

/** Heirloom botanical: antique plates as numbered specimen figures beside each section. */
export function Botanical({ ctx }: { ctx: Ctx }) {
  const { c, theme } = ctx;
  const plates = [theme.hero, ...(theme.extras ?? [])];
  const cr = theme.credit;
  return (
    <div className="t-bt">
      <header className="bt-hero">
        <p className="k bt-k rise">{c.headline || "Together with their families"}</p>
        <figure className="bt-plate rise rise-2">
          <img src={img(ctx.hero, 1200)} alt="" />
          <figcaption>
            Fig. I{cr && ctx.heroIsTheme ? ` · ${cr.title}` : ""}
          </figcaption>
        </figure>
        <h1 className="bt-names rise rise-3">
          <span className="d">{ctx.p1}</span>
          <span className="s">&amp;</span>
          <span className="d">{ctx.p2}</span>
        </h1>
        <p className="bt-tag">{c.tagline}</p>
        <p className="bt-when">
          {ctx.date}
          {c.location ? ` · ${c.location}` : ""}
        </p>
        <Countdown date={c.date} className="bt-count" />
      </header>

      <Sections
        ctx={ctx}
        wrap={(id, i, content) => {
          const plate = plates[(i + 1) % plates.length];
          const wide = ["gallery", "wishes", "party", "faq"].includes(id);
          return (
            <section id={id} className={`bt-sec ${wide ? "bt-sec--wide" : ""} ${i % 2 ? "bt-sec--flip" : ""}`}>
              {!wide && (
                <figure className="bt-spec">
                  <img src={img(plate, 800)} alt="" loading="lazy" />
                  <figcaption>Fig. {ROMAN[i + 1]}</figcaption>
                </figure>
              )}
              <div className="bt-body">
                <p className="bt-sec-no">Plate {ROMAN[i + 1]}</p>
                <h2 className="d">{title(ctx, id)}</h2>
                <div className="bt-rule" />
                {content}
              </div>
            </section>
          );
        }}
        custom={{
          details: () => (
            <>
              {events(c).map((e, i) => (
                <div key={i} className="bt-entry">
                  <p className="bt-entry-k">{e.title}</p>
                  <p className="d bt-entry-v">
                    {e.venue}
                    {e.time ? <span className="m">, {e.time}</span> : null}
                  </p>
                  <p className="m">{e.address}</p>
                  <DirectionsLink e={e} className="bt-link" />
                </div>
              ))}
              <CalendarLink ctx={ctx} className="bt-link" />
              <MapEmbed ctx={ctx} className="bt-map" />
            </>
          ),
        }}
      />

      <footer className="bt-foot">
        {cr && (
          <p className="bt-credit">
            Botanical plates: {cr.artist}, {cr.year}. Public domain.
          </p>
        )}
      </footer>
    </div>
  );
}
