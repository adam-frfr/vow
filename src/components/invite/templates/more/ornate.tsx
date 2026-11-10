import "./ornate.css";
import { Prose, Sections } from "../../blocks";
import { Countdown } from "../../Countdown";
import type { Ctx } from "../../ctx";
import { Art, dateBits, firstEvent, heroPiece, initials, Nav, pickArt, Picture, ROMAN, std, title } from "./kit";

/** Illuminated: a medieval manuscript; gilded drop capitals, red rubrics, flowers in the margins. */
export function Illuminated({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "elements", "corner"], 8);
  const cap = (s: string) => (
    <span className="il-cap" aria-hidden>
      <span className="d">{s.charAt(0).toUpperCase()}</span>
    </span>
  );
  return (
    <div className="t-il">
      <header className="il-hero">
        <div className="il-folio">
          <Art ctx={ctx} f={art[0]} className="il-margin il-margin--l" origin="tl" auto delay={400} />
          <p className="k il-rubric">Here beginneth the wedding of</p>
          <div className="il-opening">
            {cap(ctx.p1)}
            <h1 className="d il-names">
              {ctx.p1.slice(1)}
              <br />
              <span className="il-and">&amp;</span> {ctx.p2}
            </h1>
          </div>
          <p className="il-incipit">
            {c.tagline || "who joyfully invite you to celebrate their marriage"}
            {db ? `, on ${db.wd} the ${Number(db.d)}${["th", "st", "nd", "rd"][Number(db.d) % 10 > 3 || [11, 12, 13].includes(Number(db.d)) ? 0 : Number(db.d) % 10]} of ${db.month}, in the year ${db.y}` : ""}
            {c.location ? `, at ${c.location}` : ""}.
          </p>
          <Countdown date={c.date} className="il-count" />
          <Nav ctx={ctx} className="il-nav" mark={(i) => `${ROMAN[i] ?? i + 1}.`} />
        </div>
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="il-sec">
            <div className="il-folio">
              {i % 2 === 0 && <Art ctx={ctx} f={art[(i + 1) % art.length]} className={`il-margin ${i % 4 ? "il-margin--l" : "il-margin--r"}`} origin="tr" />}
              <p className="k il-rubric">Capitulum {ROMAN[i] ?? i + 1}</p>
              <h2 className="d il-h">
                {cap(title(ctx, id))}
                <span>{title(ctx, id)}</span>
              </h2>
              {content}
            </div>
          </section>
        )}
        custom={{ ...std(ctx), story: () => <Prose text={c.story.body} className="kx-prose il-prose" /> }}
      />
      <footer className="il-foot">
        <p className="k il-rubric">Explicit</p>
        <p className="s">Amor vincit omnia</p>
      </footer>
    </div>
  );
}

/** Art Deco: a Jazz-Age invitation; stepped, chamfered frames, sunburst fans and wide capitals. */
export function Deco({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const ev = firstEvent(ctx);
  return (
    <div className="t-deco">
      <header className="dc2-hero">
        <div className="dc2-frame rise">
          <div className="dc2-fan" aria-hidden />
          <div className="dc2-in">
            <p className="k">{c.headline || "The pleasure of your company is requested"}</p>
            <h1 className="dc2-names">
              <span className="d">{ctx.p1}</span>
              <span className="dc2-amp">&amp;</span>
              <span className="d">{ctx.p2}</span>
            </h1>
            <div className="dc2-date">
              <span>{db?.wd ?? ""}</span>
              <b className="d">{db ? `${db.mon} ${Number(db.d)}` : "TBA"}</b>
              <span>{db?.y ?? ""}</span>
            </div>
            {ev?.venue && <p className="k dc2-venue">{ev.venue}</p>}
            {c.location && <p className="k m">{c.location}</p>}
          </div>
        </div>
        <Countdown date={c.date} className="dc2-count" />
        <Nav ctx={ctx} className="dc2-nav" mark={() => "◆"} />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="dc2-sec">
            <div className="dc2-panel">
              <p className="k dc2-no">— {ROMAN[i] ?? i + 1} —</p>
              <h2 className="d dc2-h">{title(ctx, id)}</h2>
              <span className="dc2-steps" aria-hidden />
              <div className="dc2-body">{content}</div>
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="dc2-foot">
        <div className="dc2-fan dc2-fan--down" aria-hidden />
        <p className="d">
          {initials(c)[0]} &amp; {initials(c)[1]}
        </p>
      </footer>
    </div>
  );
}

/** Monogram Crest: a heraldic monogram in a wreath; sections alternate parchment and full colour bands. */
export function Crest({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const ini = initials(c);
  return (
    <div className="t-crest">
      <header className="cr-hero">
        <div className="cr-arms rise">
          <Art ctx={ctx} f={heroPiece(ctx, ["wreath", "frame"])} className="cr-wreath" origin="tl" auto />
          <div className="cr-mono" aria-hidden>
            <span className="d cr-l">{ini[0]}</span>
            <span className="s cr-amp">&amp;</span>
            <span className="d cr-r">{ini[1]}</span>
          </div>
        </div>
        <p className="k cr-motto">Est. {db?.y ?? "MMXXVII"}</p>
        <h1 className="d cr-names rise rise-2">
          {ctx.p1} <span className="s">&amp;</span> {ctx.p2}
        </h1>
        <p className="cr-tag">{c.tagline || "request the honour of your presence"}</p>
        <p className="k cr-date">{db ? `${db.wd} · ${db.month} ${Number(db.d)} · ${db.y}` : "Date to be announced"}</p>
        {c.location && <p className="m">{c.location}</p>}
        <Countdown date={c.date} className="cr-count" />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className={`cr-sec ${i % 2 ? "cr-sec--band" : ""}`}>
            <div className="cr-sec-in">
              <div className="cr-badge" aria-hidden>
                <span className="d">
                  {ini[0]}
                  {ini[1]}
                </span>
              </div>
              <p className="k cr-no">{ROMAN[i] ?? i + 1}</p>
              <h2 className="d cr-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}

/** Arbor: a garden of arches; the hero picture in a tall arched window, every section under an arch. */
export function Arbor({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "corner"], 8);
  return (
    <div className="t-arbor">
      <header className="ar-hero">
        <div className="ar-window rise">
          <Picture ctx={ctx} />
        </div>
        <div className="ar-text">
          <p className="k">{c.headline || "Together with their families"}</p>
          <h1 className="ar-names rise rise-2">
            <span className="s">{ctx.p1}</span>
            <span className="d">&amp;</span>
            <span className="s">{ctx.p2}</span>
          </h1>
          <p className="d ar-date">{db ? `${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
          {c.location && <p className="m">{c.location}</p>}
          <Countdown date={c.date} className="ar-count" />
        </div>
      </header>
      <Nav ctx={ctx} className="ar-nav" />
      <div className="ar-colonnade">
        <Sections
          ctx={ctx}
          decor={false}
          dividers={false}
          wrap={(id, i, content) => (
            <section id={id} className={`ar-sec ar-sec--${i % 3}`}>
              <div className="ar-arch">
                <Art ctx={ctx} f={art[(i + 1) % art.length]} className="ar-keystone" origin="tl" />
                <h2 className="d ar-h">{title(ctx, id)}</h2>
                {content}
              </div>
            </section>
          )}
          custom={std(ctx)}
        />
      </div>
    </div>
  );
}

/** Ribbon: names on a swallow-tailed ribbon banner; every heading flies its own ribbon. */
export function Ribbon({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "wreath", "elements"], 8);
  return (
    <div className="t-rb">
      <header className="rb-hero">
        <Art ctx={ctx} f={heroPiece(ctx, ["wreath", "bouquet"])} className="rb-art" origin="tl" auto />
        <h1 className="rb-banner rise rise-2">
          <span className="s">
            {ctx.p1} &amp; {ctx.p2}
          </span>
        </h1>
        <p className="k rb-k">{c.headline || "Together with their families"}</p>
        <p className="d rb-date">{db ? `${db.wd}, ${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
        {c.location && <p className="m">{c.location}</p>}
        <Countdown date={c.date} className="rb-count" />
        <Nav ctx={ctx} className="rb-nav" />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="rb-sec">
            {i % 3 === 1 && <Art ctx={ctx} f={art[(i + 1) % art.length]} className="rb-sprig" origin="tr" />}
            <h2 className={`rb-flag rb-flag--${i % 2}`}>
              <span className="d">{title(ctx, id)}</span>
            </h2>
            <div className="rb-body">{content}</div>
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}

/** Cameo: oval cameo frames; your picture in a large oval, each section crowned with a small cameo. */
export function Cameo({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "elements", "wreath"], 10);
  return (
    <div className="t-cameo">
      <header className="cm-hero">
        <div className="cm-oval rise">
          <Picture ctx={ctx} />
        </div>
        <p className="k">{c.headline || "Together with their families"}</p>
        <h1 className="cm-names rise rise-2">
          <span className="d">{ctx.p1}</span> <span className="s">&amp;</span> <span className="d">{ctx.p2}</span>
        </h1>
        <p className="k cm-date">{db ? `${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
        {c.location && <p className="m">{c.location}</p>}
        <Countdown date={c.date} className="cm-count" />
        <Nav ctx={ctx} className="cm-nav" />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="cm-sec">
            <div className="cm-mini" aria-hidden>
              <Art ctx={ctx} f={art[(i + 1) % art.length]} className="cm-mini-art" origin="tl" />
            </div>
            <h2 className="d cm-h">{title(ctx, id)}</h2>
            <div className="cm-body">{content}</div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="cm-foot">
        <p className="s">
          {ctx.p1} &amp; {ctx.p2}
        </p>
      </footer>
    </div>
  );
}
