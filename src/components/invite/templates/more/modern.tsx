import "./modern.css";
import type { CSSProperties } from "react";
import { Sections } from "../../blocks";
import { Countdown } from "../../Countdown";
import type { Ctx } from "../../ctx";
import { Art, dateBits, firstEvent, heroPiece, initials, Nav, pickArt, Picture, std, title } from "./kit";

const pad = (n: number) => String(n).padStart(2, "0");

/** Quiet: almost nothing. Small type, a lot of air, hairlines and numbers. */
export function Quiet({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const ev = firstEvent(ctx);
  return (
    <div className="t-qt">
      <header className="qt-hero">
        <div className="qt-top">
          <span className="k">
            {initials(c)[0]} / {initials(c)[1]}
          </span>
          <span className="k">{db ? `${db.d}.${db.m}.${db.y}` : "TBA"}</span>
        </div>
        <div className="qt-main">
          <h1 className="d qt-names rise">
            {ctx.p1}
            <br />
            and {ctx.p2}
          </h1>
          <p className="qt-line rise rise-2">
            {c.tagline || "are getting married"}
            {ev?.venue ? `, ${ev.venue}` : ""}
            {c.location ? `, ${c.location}` : ""}.
          </p>
        </div>
        <div className="qt-bottom">
          <Nav ctx={ctx} className="qt-nav" />
          <Countdown date={c.date} className="qt-count" />
        </div>
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="qt-row">
            <span className="qt-no">{pad(i + 1)}</span>
            <h2 className="qt-h">{title(ctx, id)}</h2>
            <div className="qt-body">{content}</div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="qt-foot">
        <span className="k">
          {ctx.p1} &amp; {ctx.p2}
        </span>
        <span className="k">{db?.y}</span>
      </footer>
    </div>
  );
}

/** Washi: Japanese-paper calm; names set vertically beside a painted stem, with a red seal. */
export function Washi({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const ini = initials(c);
  const art = pickArt(ctx, ["bouquet", "elements"], 8);
  return (
    <div className="t-wsh">
      <header className="wsh-hero">
        <div className="wsh-art">
          <Art ctx={ctx} f={heroPiece(ctx, ["bouquet"])} className="wsh-stem" origin="bl" auto />
        </div>
        <h1 className="wsh-names rise">
          <span className="d">{ctx.p1}</span>
          <span className="s">&amp;</span>
          <span className="d">{ctx.p2}</span>
        </h1>
        <div className="wsh-side">
          <span className="wsh-seal" aria-hidden>
            {ini[0]}
            <br />
            {ini[1]}
          </span>
          <p className="k wsh-date">{db ? `${db.y} · ${db.m} · ${db.d}` : "Date to come"}</p>
          {c.location && <p className="k m wsh-loc">{c.location}</p>}
        </div>
      </header>
      <div className="wsh-mid">
        <p className="wsh-tag">{c.tagline || "invite you to celebrate their wedding"}</p>
        <Countdown date={c.date} className="wsh-count" />
        <Nav ctx={ctx} className="wsh-nav" />
      </div>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="wsh-sec">
            <h2 className="d wsh-h">
              <span className="wsh-h-no">{pad(i + 1)}</span>
              {title(ctx, id)}
            </h2>
            <div className="wsh-body">
              {i % 3 === 1 && <Art ctx={ctx} f={art[(i + 1) % art.length]} className="wsh-sprig" origin="tr" />}
              {content}
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="wsh-foot">
        <span className="wsh-seal" aria-hidden>
          {ini[0]}
          <br />
          {ini[1]}
        </span>
      </footer>
    </div>
  );
}

/** Halo: everything round; names inside a great ring, sections led by circular medallions. */
export function Halo({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "elements", "wreath"], 8);
  return (
    <div className="t-halo">
      <header className="ha-hero">
        <div className="ha-ring rise">
          <Art ctx={ctx} f={art[0]} className="ha-orbit ha-orbit--a" origin="tl" auto delay={300} />
          <Art ctx={ctx} f={art[1]} className="ha-orbit ha-orbit--b" origin="br" auto delay={700} />
          <p className="k">{c.headline || "Together with their families"}</p>
          <h1 className="ha-names">
            <span className="s">{ctx.p1}</span>
            <span className="d">&amp;</span>
            <span className="s">{ctx.p2}</span>
          </h1>
          <p className="k ha-date">{db ? `${db.month} ${Number(db.d)} · ${db.y}` : "Date to be announced"}</p>
          {c.location && <p className="m ha-loc">{c.location}</p>}
        </div>
        <Countdown date={c.date} className="ha-count" />
        <Nav ctx={ctx} className="ha-nav" />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="ha-sec">
            <div className="ha-medal" aria-hidden>
              <Art ctx={ctx} f={art[(i + 2) % art.length]} className="ha-medal-art" origin="tl" />
              <span className="d">{pad(i + 1)}</span>
            </div>
            <div className="ha-body">
              <h2 className="d ha-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}

/** Diagonal: bold slanted bands; the page is cut on the bias between every section. */
export function Diagonal({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  return (
    <div className="t-dg">
      <header className="dg-hero">
        <div className="dg-pic">
          <Picture ctx={ctx} />
        </div>
        <div className="dg-text">
          <p className="k">{c.headline || "Together with their families"}</p>
          <h1 className="d dg-names rise">
            {ctx.p1}
            <span className="dg-amp"> + </span>
            {ctx.p2}
          </h1>
          <p className="k dg-date">{db ? `${db.wd} / ${db.month} ${Number(db.d)} / ${db.y}` : "Date to be announced"}</p>
          {c.location && <p className="m">{c.location}</p>}
          <Countdown date={c.date} className="dg-count" />
        </div>
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className={`dg-band dg-band--${i % 3}`}>
            <div className="dg-in">
              <p className="d dg-no">{pad(i + 1)}</p>
              <h2 className="d dg-h">{title(ctx, id)}</h2>
              <div className="dg-body">{content}</div>
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="dg-foot">
        <p className="d">
          {ctx.p1} + {ctx.p2}
        </p>
      </footer>
    </div>
  );
}

/** Ombré: the page deepens from paper to your accent colour, one step per section. */
export function Ombre({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const n = ctx.sections.length;
  const art = pickArt(ctx, ["bouquet", "wreath"], 6);
  return (
    <div className="t-om">
      <header className="om-hero">
        <Art ctx={ctx} f={heroPiece(ctx, ["wreath", "bouquet"])} className="om-art" origin="tl" auto />
        <p className="k">{c.headline || "Together with their families"}</p>
        <h1 className="om-names rise">
          <span className="s">{ctx.p1}</span> <span className="d">&amp;</span> <span className="s">{ctx.p2}</span>
        </h1>
        <p className="k om-date">{db ? `${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
        {c.location && <p className="m">{c.location}</p>}
        <Countdown date={c.date} className="om-count" />
        <Nav ctx={ctx} className="om-nav" />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="om-sec" style={{ "--step": `${Math.round(((i + 1) / n) * 30)}%` } as CSSProperties}>
            <div className="om-in">
              {i === n - 1 && <Art ctx={ctx} f={art[1 % art.length]} className="om-end-art" origin="tl" />}
              <h2 className="d om-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}

/** Verse: the invitation as a poem; your names are its title and each section is a stanza. */
export function Verse({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "elements"], 6);
  return (
    <div className="t-vs">
      <header className="vs-hero">
        <Art ctx={ctx} f={art[0]} className="vs-art" origin="tl" auto />
        <h1 className="vs-title rise">
          <span className="s">{ctx.p1}</span>
          <span className="vs-and">and</span>
          <span className="s">{ctx.p2}</span>
        </h1>
        <p className="vs-epi rise rise-2">
          <i>{c.tagline || "invite you to celebrate their wedding"}</i>
          <br />— {db ? `${db.month} ${Number(db.d)}, ${db.y}` : "date to come"}
          {c.location ? `, ${c.location}` : ""}
        </p>
        <Countdown date={c.date} className="vs-count" />
        <Nav ctx={ctx} className="vs-nav" />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="vs-stanza">
            <p className="vs-no" aria-hidden>
              {pad(i + 1)}
            </p>
            <h2 className="d vs-h">{title(ctx, id)}</h2>
            <div className="vs-body">{content}</div>
            <p className="vs-orn" aria-hidden>
              ~
            </p>
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}

/** Fold: a tri-fold paper invitation; the hero opens in three creased panels and sections fold like a leaflet. */
export function Fold({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const ev = firstEvent(ctx);
  const art = pickArt(ctx, ["bouquet", "wreath", "elements"], 6);
  return (
    <div className="t-fold">
      <header className="fo-hero">
        <div className="fo-trifold rise">
          <div className="fo-panel fo-panel--l">
            <Art ctx={ctx} f={art[1 % art.length]} className="fo-art" origin="bl" auto delay={500} />
            <p className="k">{c.headline || "Together with their families"}</p>
          </div>
          <div className="fo-panel fo-panel--c">
            <h1 className="fo-names">
              <span className="s">{ctx.p1}</span>
              <span className="d">&amp;</span>
              <span className="s">{ctx.p2}</span>
            </h1>
            <p className="k fo-date">{db ? `${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
          </div>
          <div className="fo-panel fo-panel--r">
            <p className="d">{ev?.venue || c.location || "Venue to be announced"}</p>
            {ev?.formal && <p className="m">{ev.formal}</p>}
            {c.location && ev?.venue && <p className="m">{c.location}</p>}
          </div>
        </div>
        <Countdown date={c.date} className="fo-count" />
        <Nav ctx={ctx} className="fo-nav" />
      </header>
      <div className="fo-leaflet">
        <Sections
          ctx={ctx}
          decor={false}
          dividers={false}
          wrap={(id, i, content) => (
            <section id={id} className={`fo-sec fo-sec--${i % 2}`}>
              <h2 className="d fo-h">{title(ctx, id)}</h2>
              {content}
            </section>
          )}
          custom={std(ctx)}
        />
      </div>
    </div>
  );
}

/** Type Specimen: a typographer's specimen sheet set in your fonts; huge initials, sizes and glyphs. */
export function Specimen({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const ini = initials(c);
  const f = ctx.theme.fonts;
  const sizes = ["96", "72", "60", "48", "36", "30", "24"];
  return (
    <div className="t-spec">
      <header className="spc-hero">
        <div className="spc-meta">
          <span className="k">Specimen No. {db ? `${db.y}${db.m}${db.d}` : "01"}</span>
          <span className="k">Display · {f.display}</span>
          <span className="k">Text · {f.body}</span>
        </div>
        <p className="spc-glyphs d rise" aria-hidden>
          {ini[0]}
          <span className="s">&amp;</span>
          {ini[1]}
        </p>
        <h1 className="d spc-names rise rise-2">
          {ctx.p1} &amp; {ctx.p2}
        </h1>
        <div className="spc-line">
          <span className="k">{db ? `${db.wd}, ${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</span>
          {c.location && <span className="k">{c.location}</span>}
          <Countdown date={c.date} className="spc-count" />
        </div>
        <Nav ctx={ctx} className="spc-nav" />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="spc-sec">
            <div className="spc-ruler">
              <span className="k">{pad(i + 1)}</span>
              <span className="k">{sizes[i % sizes.length]} pt</span>
            </div>
            <h2 className="d spc-h" style={{ fontSize: `clamp(2rem, ${7 - (i % 4)}cqi, ${4.6 - (i % 4) * 0.4}rem)` }}>
              {title(ctx, id)}
            </h2>
            <div className="spc-body">{content}</div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="spc-foot">
        <p className="d" aria-hidden>
          Aa Bb Cc &amp; 0123456789
        </p>
      </footer>
    </div>
  );
}
