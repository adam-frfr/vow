/* eslint-disable @next/next/no-img-element */
import "./photo.css";
import { GalleryImg, Sections } from "../../blocks";
import { Countdown } from "../../Countdown";
import type { Ctx } from "../../ctx";
import { img } from "@/lib/themes";
import { Art, dateBits, firstEvent, heroPhoto, heroPiece, Nav, photo, pickArt, Picture, std, title } from "./kit";

const pad = (n: number) => String(n).padStart(2, "0");

/** Photo Booth: a strip of four frames beside your names; sections pinned with booth prints. */
export function Booth({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "elements"], 4);
  return (
    <div className="t-booth">
      <header className="bo-hero">
        <div className="bo-strip rise" aria-hidden>
          {[0, 1, 2, 3].map((k) => (
            <GalleryImg key={k} src={photo(ctx, k)} w={500} eager />
          ))}
          <p>
            {ctx.p1[0]} + {ctx.p2[0]} · {db ? `${db.m}.${db.d}.${db.yy}` : "soon"}
          </p>
        </div>
        <div className="bo-text">
          <p className="k">{c.headline || "Smile! We're getting married"}</p>
          <h1 className="bo-names rise rise-2">
            <span className="s">{ctx.p1}</span>
            <span className="d">&amp;</span>
            <span className="s">{ctx.p2}</span>
          </h1>
          <p className="d bo-date">{db ? `${db.wd}, ${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
          {c.location && <p className="m">{c.location}</p>}
          <Countdown date={c.date} className="bo-count" />
          <Art ctx={ctx} f={art[0]} className="bo-art" origin="br" auto delay={500} />
        </div>
      </header>
      <Nav ctx={ctx} className="bo-nav" />
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className={`bo-sec ${i % 2 ? "bo-sec--r" : ""}`}>
            <figure className="bo-print" aria-hidden>
              <GalleryImg src={photo(ctx, i + 4)} w={500} />
              <figcaption>
                {pad(i + 1)} · {title(ctx, id)}
              </figcaption>
            </figure>
            <div className="bo-body">
              <h2 className="s bo-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={std(ctx, { caption: (i) => `frame ${i + 1}` })}
      />
      <footer className="bo-foot">
        <p className="s">Say cheese!</p>
      </footer>
    </div>
  );
}

/** Lookbook: a fashion lookbook; big offset images, small captions, lots of air. */
export function Lookbook({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  return (
    <div className="t-lb">
      <header className="lb-hero">
        <div className="lb-hero-pic">
          <Picture ctx={ctx} w={1800} />
        </div>
        <div className="lb-hero-text">
          <p className="k">Look 00 · {db?.y ?? "The wedding"}</p>
          <h1 className="d lb-names rise">
            {ctx.p1}
            <br />
            <i className="s">&amp;</i> {ctx.p2}
          </h1>
          <p className="lb-cap rise rise-2">{c.tagline || "invite you to celebrate their wedding"}</p>
          <p className="k m">
            {db ? `${db.month} ${Number(db.d)}` : "Date to be announced"}
            {c.location ? ` — ${c.location}` : ""}
          </p>
          <Countdown date={c.date} className="lb-count" />
        </div>
      </header>
      <Nav ctx={ctx} className="lb-nav" mark={(i) => pad(i + 1)} />
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className={`lb-sec ${i % 2 ? "lb-sec--r" : ""}`}>
            {id !== "gallery" && (
              <figure className="lb-look">
                <GalleryImg src={photo(ctx, i)} w={900} />
                <figcaption>
                  Look {pad(i + 1)} — {title(ctx, id)}
                </figcaption>
              </figure>
            )}
            <div className="lb-body">
              <p className="k lb-k">Look {pad(i + 1)}</p>
              <h2 className="d lb-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={std(ctx, { caption: (i) => `Look ${pad(i + 1)}`, w: 900 })}
      />
      <footer className="lb-foot">
        <p className="d">
          {ctx.p1} &amp; {ctx.p2}
        </p>
        <p className="k m">Fin.</p>
      </footer>
    </div>
  );
}

/** Diptych: every section is a pair of panels; a photograph stays put while its text scrolls. */
export function Diptych({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const ev = firstEvent(ctx);
  return (
    <div className="t-dp">
      <header className="dp-pair dp-hero">
        <div className="dp-pic">
          <Picture ctx={ctx} />
        </div>
        <div className="dp-text dp-hero-text">
          <p className="k">{c.headline || "Together with their families"}</p>
          <h1 className="dp-names rise">
            <span className="d">{ctx.p1}</span>
            <span className="s">and</span>
            <span className="d">{ctx.p2}</span>
          </h1>
          <p className="k dp-date">{db ? `${db.wd} · ${db.month} ${Number(db.d)} · ${db.y}` : "Date to be announced"}</p>
          {ev?.venue && <p className="m">{[ev.venue, c.location].filter(Boolean).join(", ")}</p>}
          <Countdown date={c.date} className="dp-count" />
        </div>
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className={`dp-pair ${i % 2 ? "" : "dp-pair--r"}`}>
            <div className="dp-pic dp-pic--sticky">
              <GalleryImg src={photo(ctx, i + 1)} w={1200} />
              <span className="dp-tag">
                {pad(i + 1)} / {title(ctx, id)}
              </span>
            </div>
            <div className="dp-text">
              <h2 className="d dp-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}

/** Cover Reveal: one photograph stays fixed behind the page; sections slide over it as sheets. */
export function CoverReveal({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const bg = heroPhoto(ctx);
  const art = bg !== ctx.hero;
  const sprigs = pickArt(ctx, ["bouquet", "corner"], 5);
  return (
    <div className="t-cv">
      <div className="cv-bg" aria-hidden>
        <img src={img(bg, 2000)} alt="" style={{ filter: art ? undefined : ctx.heroFilter }} />
      </div>
      <header className="cv-hero">
        <p className="k">{c.headline || "Together with their families"}</p>
        <h1 className="cv-names rise">
          <span className="s">{ctx.p1}</span>
          <span className="d cv-amp">&amp;</span>
          <span className="s">{ctx.p2}</span>
        </h1>
        <p className="k cv-date rise rise-2">{db ? `${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
        {c.location && <p className="cv-loc">{c.location}</p>}
        <Countdown date={c.date} className="cv-count" />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="cv-sheet">
            <Art ctx={ctx} f={sprigs[i % sprigs.length]} className="cv-sprig" origin="tr" />
            <p className="k cv-k">{pad(i + 1)}</p>
            <h2 className="d cv-h">{title(ctx, id)}</h2>
            {content}
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="cv-foot">
        <p className="s">
          {ctx.p1} &amp; {ctx.p2}
        </p>
      </footer>
    </div>
  );
}

/** Window Panes: the hero photo is seen through a six-pane window; sections each get a small window. */
export function Panes({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const src = heroPhoto(ctx);
  const pane = (s: string, cols: number, rows: number, cls: string) => (
    <div className={cls} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} aria-hidden>
      {Array.from({ length: cols * rows }, (_, k) => (
        <span
          key={k}
          style={{
            backgroundImage: `url("${img(s, 1600)}")`,
            backgroundSize: `${cols * 100}% ${rows * 100}%`,
            backgroundPosition: `${cols > 1 ? ((k % cols) / (cols - 1)) * 100 : 50}% ${rows > 1 ? (Math.floor(k / cols) / (rows - 1)) * 100 : 50}%`,
          }}
        />
      ))}
    </div>
  );
  return (
    <div className="t-pn">
      <header className="pn-hero">
        {pane(src, 3, 2, "pn-window")}
        <div className="pn-sill">
          <h1 className="pn-names rise">
            <span className="s">{ctx.p1}</span> <span className="d">&amp;</span> <span className="s">{ctx.p2}</span>
          </h1>
          <p className="k">
            {db ? `${db.wd} · ${db.month} ${Number(db.d)} · ${db.y}` : "Date to be announced"}
            {c.location ? ` · ${c.location}` : ""}
          </p>
          <Countdown date={c.date} className="pn-count" />
        </div>
      </header>
      <Nav ctx={ctx} className="pn-nav" />
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className={`pn-sec ${i % 2 ? "pn-sec--r" : ""}`}>
            {id !== "gallery" && pane(photo(ctx, i + 1), 2, 2, "pn-window pn-window--sm")}
            <div className="pn-body">
              <h2 className="d pn-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}

/** Collage: photographs, painted flowers and paper cards layered and overlapping. */
export function Collage({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "corner", "elements"], 8);
  return (
    <div className="t-clg">
      <header className="clg-hero">
        <div className="clg-stage">
          <GalleryImg src={photo(ctx, 0)} w={900} className="clg-ph clg-ph--a" eager />
          <GalleryImg src={photo(ctx, 1)} w={700} className="clg-ph clg-ph--b" eager />
          <GalleryImg src={photo(ctx, 2)} w={600} className="clg-ph clg-ph--c" eager />
          <Art ctx={ctx} f={heroPiece(ctx, ["bouquet"])} className="clg-art clg-art--a" origin="bl" auto delay={300} />
          <Art ctx={ctx} f={art[1]} className="clg-art clg-art--b" origin="tr" auto delay={700} />
          <div className="clg-card rise">
            <p className="k">{c.headline || "Together with their families"}</p>
            <h1 className="clg-names">
              <span className="s">{ctx.p1}</span>
              <span className="d">&amp;</span>
              <span className="s">{ctx.p2}</span>
            </h1>
            <p className="k clg-date">{db ? `${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
            {c.location && <p className="m">{c.location}</p>}
          </div>
        </div>
        <Countdown date={c.date} className="clg-count" />
      </header>
      <Nav ctx={ctx} className="clg-nav" />
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className={`clg-sec ${i % 2 ? "clg-sec--r" : ""}`}>
            {id !== "gallery" && i % 2 === 0 && <GalleryImg src={photo(ctx, i + 3)} w={600} className="clg-peek" />}
            <Art ctx={ctx} f={art[(i + 2) % art.length]} className="clg-sprig" origin={i % 2 ? "tl" : "tr"} />
            <div className="clg-paper">
              <h2 className="d clg-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}
