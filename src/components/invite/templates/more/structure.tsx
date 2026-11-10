import "./structure.css";
import type { SectionId } from "@/lib/content";
import { Sections } from "../../blocks";
import { Countdown } from "../../Countdown";
import type { Ctx } from "../../ctx";
import { Art, dateBits, firstEvent, heroIsArt, heroPiece, initials, Nav, photo, pickArt, Picture, std, title } from "./kit";
import { GalleryImg } from "../../blocks";

const pad = (n: number) => String(n).padStart(2, "0");

/** Card Stack: sections are cards dealt onto a pile, each overlapping the last. */
export function Stack({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "corner", "elements"], 6);
  return (
    <div className="t-stack">
      <header className="cst-hero">
        <div className={`cst-hero-pic ${heroIsArt(ctx) ? "is-art" : ""}`}>
          <Picture ctx={ctx} />
        </div>
        <div className="cst-hero-text">
          <p className="k rise">{c.headline || "Together with their families"}</p>
          <h1 className="d cst-names rise rise-2">
            {ctx.p1}
            <span className="s cst-amp"> &amp; </span>
            {ctx.p2}
          </h1>
          <p className="k cst-date rise rise-3">{db ? `${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
          {c.location && <p className="m">{c.location}</p>}
          <Countdown date={c.date} className="cst-count" />
        </div>
      </header>
      <div className="cst-pile">
        <Sections
          ctx={ctx}
          decor={false}
          dividers={false}
          wrap={(id, i, content) => (
            <section id={id} className={`cst-card cst-card--${i % 3}`} style={{ zIndex: i + 1 }}>
              <div className="cst-tab">
                <span className="d">{pad(i + 1)}</span>
                <span className="k">{title(ctx, id)}</span>
              </div>
              <Art ctx={ctx} f={art[i % art.length]} className="cst-art" origin="tr" />
              <h2 className="d cst-h">{title(ctx, id)}</h2>
              <div className="cst-body">{content}</div>
            </section>
          )}
          custom={std(ctx)}
        />
      </div>
      <footer className="cst-foot">
        <p className="s">
          {ctx.p1} &amp; {ctx.p2}
        </p>
      </footer>
    </div>
  );
}

/** Slides: every section is a full-screen slide with a counter and a progress rail. */
export function Slides({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const n = ctx.sections.length;
  const art = pickArt(ctx, ["bouquet", "wreath", "frame", "corner"], 8);
  return (
    <div className="t-slides">
      <header className="sl-slide sl-hero">
        <div className="sl-hero-art">
          <Picture ctx={ctx} />
        </div>
        <div className="sl-hero-text">
          <p className="k">
            {pad(0)} / {pad(n)}
          </p>
          <h1 className="sl-names rise">
            <span className="d">{ctx.p1}</span>
            <span className="s sl-amp">and</span>
            <span className="d">{ctx.p2}</span>
          </h1>
          <p className="d sl-date rise rise-2">{db ? `${Number(db.d)}.${db.m}.${db.y}` : "Date to be announced"}</p>
          {c.location && <p className="k m">{c.location}</p>}
          <Countdown date={c.date} className="sl-count" />
          <p className="k sl-scroll">Scroll ↓</p>
        </div>
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className={`sl-slide sl-sec sl-sec--${i % 3}`}>
            <div className="sl-rail" aria-hidden>
              {ctx.sections.map((s, j) => (
                <i key={s} className={j <= i ? "on" : ""} />
              ))}
            </div>
            <div className="sl-grid">
              <div className="sl-head">
                <p className="k sl-no">
                  {pad(i + 1)} / {pad(n)}
                </p>
                <h2 className="d sl-h">{title(ctx, id)}</h2>
                <Art ctx={ctx} f={art[(i + 1) % art.length]} className="sl-art" origin={i % 2 ? "bl" : "br"} />
              </div>
              <div className="sl-body">{content}</div>
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="sl-slide sl-end">
        <p className="s">Thank you</p>
        <p className="k m">
          {ctx.p1} &amp; {ctx.p2} · {db?.y}
        </p>
      </footer>
    </div>
  );
}

/** Timeline: one line runs down the page; each section is a stop on it. */
export function Timeline({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const wreath = heroPiece(ctx, ["wreath", "frame"]);
  const sprigs = pickArt(ctx, ["bouquet", "elements"], 6);
  return (
    <div className="t-tl">
      <header className="tl-hero">
        <div className="tl-wreath-wrap">
          <Art ctx={ctx} f={wreath} className="tl-wreath" origin="tl" auto />
          <div className="tl-mono d">
            {initials(c)[0]}
            <span className="s">&amp;</span>
            {initials(c)[1]}
          </div>
        </div>
        <h1 className="d tl-names rise">
          {ctx.p1} <span className="s">&amp;</span> {ctx.p2}
        </h1>
        <p className="k tl-date rise rise-2">{db ? `${db.wd} · ${db.month} ${Number(db.d)} · ${db.y}` : "Date to be announced"}</p>
        {c.location && <p className="m">{c.location}</p>}
        <Countdown date={c.date} className="tl-count" />
      </header>
      <div className="tl-line">
        <Sections
          ctx={ctx}
          decor={false}
          dividers={false}
          wrap={(id, i, content) => (
            <section id={id} className={`tl-stop ${i % 2 ? "tl-stop--r" : ""}`}>
              <span className="tl-node" aria-hidden />
              <div className="tl-meta">
                <span className="k">Stop {i + 1}</span>
                <Art ctx={ctx} f={sprigs[i % sprigs.length]} className="tl-sprig" origin={i % 2 ? "tl" : "tr"} />
              </div>
              <div className="tl-card">
                <h2 className="d tl-h">{title(ctx, id)}</h2>
                {content}
              </div>
            </section>
          )}
          custom={std(ctx)}
        />
      </div>
      <footer className="tl-end">
        <span className="tl-node" aria-hidden />
        <p className="s">and so it begins</p>
      </footer>
    </div>
  );
}

/** Index: a fixed side column (names, date, contents) beside the scrolling page. */
export function IndexSide({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const ev = firstEvent(ctx);
  const art = heroPiece(ctx, ["bouquet", "wreath"]);
  const sprigs = pickArt(ctx, ["bouquet", "elements"], 5);
  return (
    <div className="t-ix">
      <aside className="ix-side">
        <div className="ix-side-in">
          <Art ctx={ctx} f={art} className="ix-art" origin="tl" auto />
          <h1 className="ix-names">
            <span className="s">{ctx.p1}</span>
            <span className="k">and</span>
            <span className="s">{ctx.p2}</span>
          </h1>
          <p className="d ix-date">{db ? `${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
          {ev?.venue && <p className="m ix-venue">{ev.venue}</p>}
          {c.location && <p className="m ix-venue">{c.location}</p>}
          <Nav ctx={ctx} className="ix-nav" mark={(i) => pad(i + 1)} />
        </div>
      </aside>
      <main className="ix-main">
        <div className="ix-intro">
          <p className="k m">{c.headline || "Together with their families"}</p>
          <p className="d ix-tag">{c.tagline || "invite you to celebrate their wedding"}</p>
          <Countdown date={c.date} className="ix-count" />
        </div>
        <Sections
          ctx={ctx}
          decor={false}
          dividers={false}
          wrap={(id, i, content) => (
            <section id={id} className="ix-sec">
              <header className="ix-sec-head">
                <span className="ix-no">{pad(i + 1)}</span>
                <h2 className="d ix-h">{title(ctx, id)}</h2>
                {i % 3 === 0 && <Art ctx={ctx} f={sprigs[(i / 3) % sprigs.length]} className="ix-sprig" origin="tr" />}
              </header>
              {content}
            </section>
          )}
          custom={std(ctx)}
        />
      </main>
    </div>
  );
}

const SPAN: Partial<Record<SectionId, string>> = { story: "w", details: "w", gallery: "f", rsvp: "f", faq: "w", wishes: "w", schedule: "t", party: "w", travel: "t" };

/** Bento: the whole site is a grid of rounded tiles, the hero included. */
export function Bento({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const ev = firstEvent(ctx);
  const art = pickArt(ctx, ["bouquet", "wreath", "frame"], 4);
  return (
    <div className="t-bento">
      <header className="bn-grid bn-hero">
        <div className="bn-tile bn-names">
          <p className="k">{c.headline || "We're getting married"}</p>
          <h1 className="d rise">
            {ctx.p1}
            <br />
            <span className="s">&amp;</span> {ctx.p2}
          </h1>
        </div>
        <div className="bn-tile bn-art">
          <Art ctx={ctx} f={heroPiece(ctx)} className="bn-art-img" origin="bl" auto />
        </div>
        <div className="bn-tile bn-date">
          <span className="k">{db?.mon ?? "Date"}</span>
          <b className="d">{db ? Number(db.d) : "—"}</b>
          <span className="k">{db?.y ?? "TBA"}</span>
        </div>
        <div className="bn-tile bn-where">
          <span className="k">Where</span>
          <p className="d">{ev?.venue || c.location || "To be announced"}</p>
          {ev?.venue && c.location && <p className="m">{c.location}</p>}
        </div>
        <div className="bn-tile bn-photo">
          <GalleryImg src={photo(ctx, 0)} w={700} eager />
        </div>
        <div className="bn-tile bn-cd">
          <Countdown date={c.date} />
        </div>
        <nav className="bn-tile bn-nav">
          {ctx.sections.map((id) => (
            <a key={id} href={`#${id}`}>
              {title(ctx, id)} <span>→</span>
            </a>
          ))}
        </nav>
      </header>
      <div className="bn-grid bn-body">
        <Sections
          ctx={ctx}
          decor={false}
          dividers={false}
          wrap={(id, i, content) => (
            <section id={id} className={`bn-tile bn-sec bn-sec--${SPAN[id] ?? "n"} ${i % 4 === 1 ? "bn-sec--tint" : ""}`}>
              <h2 className="d bn-h">{title(ctx, id)}</h2>
              {content}
              {i % 4 === 2 && <Art ctx={ctx} f={art[(i + 1) % art.length]} className="bn-corner" origin="br" />}
            </section>
          )}
          custom={std(ctx)}
        />
      </div>
    </div>
  );
}

/** Marquee: giant names and ticker tapes of good news running between sections. */
export function Marquee({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const when = db ? `${db.month} ${Number(db.d)} ${db.y}` : "Save the date";
  const tape = (words: string[], rev = false) => (
    <div className={`mq-tape ${rev ? "mq-tape--rev" : ""}`} aria-hidden>
      <div className="mq-run">
        {[0, 1].map((k) => (
          <span key={k}>
            {Array.from({ length: 4 }, () => words)
              .flat()
              .map((w, j) => (
                <span key={j}>
                  {w} <i>✦</i>{" "}
                </span>
              ))}
          </span>
        ))}
      </div>
    </div>
  );
  const art = pickArt(ctx, ["bouquet", "wreath", "corner"], 6);
  return (
    <div className="t-mq">
      <header className="mq-hero">
        <p className="k mq-k">{c.headline || "Together with their families"}</p>
        <h1 className="d mq-names">
          <span className="rise">{ctx.p1}</span>
          <span className="s mq-amp rise rise-2">&amp;</span>
          <span className="rise rise-3">{ctx.p2}</span>
        </h1>
        <Art ctx={ctx} f={heroPiece(ctx, ["bouquet"])} className="mq-art" origin="br" auto delay={400} />
        <div className="mq-hero-foot">
          <p className="k">{when}</p>
          <Countdown date={c.date} className="mq-count" />
          <p className="k">{c.location}</p>
        </div>
      </header>
      {tape(["Save the date", when, c.location || "Celebrate with us"].filter(Boolean))}
      <Nav ctx={ctx} className="mq-nav" />
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <>
            {i > 0 && i % 3 === 0 && tape([ctx.p1, "&", ctx.p2, when], i % 2 === 1)}
            <section id={id} className="mq-sec">
              <div className="mq-sec-head">
                <span className="mq-no d">{pad(i + 1)}</span>
                <h2 className="d mq-h">{title(ctx, id)}</h2>
                {i % 2 === 0 && <Art ctx={ctx} f={art[i % art.length]} className="mq-sprig" origin="tr" />}
              </div>
              <div className="mq-body">{content}</div>
            </section>
          </>
        )}
        custom={std(ctx)}
      />
      {tape(["See you there", ctx.p1 + " & " + ctx.p2], true)}
    </div>
  );
}
