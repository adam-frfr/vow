import "./keepsake.css";
import { Sections } from "../../blocks";
import { Countdown } from "../../Countdown";
import type { Ctx } from "../../ctx";
import { Art, dateBits, firstEvent, heroPiece, initials, Nav, pickArt, ROMAN, std, title } from "./kit";

const pad = (n: number) => String(n).padStart(2, "0");
const mrz = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, "<");

/** Passport: a passport cover and data page; every section is a stamped visa page. */
export function Passport({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const crest = heroPiece(ctx, ["wreath", "frame"]);
  const issued = db ? `${db.d} ${db.mon.toUpperCase()} ${db.y}` : "TBA";
  return (
    <div className="t-psp">
      <header className="psp-hero">
        <div className="psp-cover rise">
          <p className="k">Passport</p>
          <Art ctx={ctx} f={crest} className="psp-crest" origin="tl" auto />
          <p className="d psp-cover-title">to forever</p>
          <p className="k psp-cover-names">
            {ctx.p1} &amp; {ctx.p2}
          </p>
        </div>
        <div className="psp-data rise rise-2">
          <p className="k psp-data-k">Type P · Code WED · Passport No. {db ? `${db.y}${db.m}${db.d}` : "000000"}</p>
          <h1 className="psp-names">
            <span className="s">{ctx.p1}</span>
            <span className="d">&amp;</span>
            <span className="s">{ctx.p2}</span>
          </h1>
          <dl className="psp-fields">
            <div>
              <dt>Date of issue</dt>
              <dd>{issued}</dd>
            </div>
            <div>
              <dt>Place</dt>
              <dd>{c.location || "To be announced"}</dd>
            </div>
            <div>
              <dt>Holders</dt>
              <dd>{c.headline || "Together with their families"}</dd>
            </div>
            <div>
              <dt>Valid until</dt>
              <dd>Forever</dd>
            </div>
          </dl>
          <p className="psp-mrz" aria-hidden>
            {`P<WED${mrz(ctx.p1)}<<${mrz(ctx.p2)}`.padEnd(44, "<").slice(0, 44)}
            <br />
            {`${db ? db.y + db.m + db.d : "00000000"}<FOREVER<<LOVE`.padEnd(44, "<").slice(0, 44)}
          </p>
          <Countdown date={c.date} className="psp-count" />
        </div>
      </header>
      <Nav ctx={ctx} className="psp-nav" mark={(i) => `p.${i + 2}`} />
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="psp-page">
            <div className={`psp-stamp psp-stamp--${i % 3}`} aria-hidden>
              <span className="k">Admitted</span>
              <b className="d">{title(ctx, id)}</b>
              <span className="k">{issued}</span>
            </div>
            <p className="k psp-visa">Visa · page {i + 2}</p>
            <h2 className="d psp-h">{title(ctx, id)}</h2>
            {content}
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}

/** Calendar: a wall calendar with your day circled; sections are calendar pages. */
export function Calendar({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "wreath", "elements"], 8);
  let cells: (number | null)[] = [];
  if (db) {
    const first = new Date(Date.UTC(Number(db.y), Number(db.m) - 1, 1)).getUTCDay();
    const days = new Date(Date.UTC(Number(db.y), Number(db.m), 0)).getUTCDate();
    cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, k) => k + 1)];
  }
  return (
    <div className="t-cal">
      <header className="ca-hero">
        <div className="ca-page rise">
          <div className="ca-art-top">
            <Art ctx={ctx} f={heroPiece(ctx, ["bouquet", "wreath"])} className="ca-art" origin="bl" auto />
          </div>
          <div className="ca-month">
            <p className="d">{db?.month ?? "Save the date"}</p>
            <p className="k">{db?.y}</p>
          </div>
          {db && (
            <div className="ca-grid" role="img" aria-label={`${db.month} ${Number(db.d)}, ${db.y}`}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, k) => (
                <span key={`h${k}`} className="ca-dow">
                  {d}
                </span>
              ))}
              {cells.map((d, k) => (
                <span key={k} className={d === Number(db.d) ? "ca-day ca-day--on" : "ca-day"}>
                  {d ?? ""}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="ca-text">
          <p className="k">{c.headline || "Mark your calendar"}</p>
          <h1 className="ca-names rise rise-2">
            <span className="s">{ctx.p1}</span>
            <span className="d">&amp;</span>
            <span className="s">{ctx.p2}</span>
          </h1>
          <p className="d ca-date">{db ? `${db.wd}, ${db.month} ${Number(db.d)}` : "Date to be announced"}</p>
          {c.location && <p className="m">{c.location}</p>}
          <Countdown date={c.date} className="ca-count" />
          <Nav ctx={ctx} className="ca-nav" />
        </div>
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="ca-sec">
            <div className="ca-sheet">
              <div className="ca-sheet-head">
                <span className="d ca-sheet-no">{pad(i + 1)}</span>
                <div>
                  <p className="k">{db ? `${db.month} ${db.y}` : "The big day"}</p>
                  <h2 className="d ca-h">{title(ctx, id)}</h2>
                </div>
                <Art ctx={ctx} f={art[(i + 1) % art.length]} className="ca-sheet-art" origin="tr" />
              </div>
              <div className="ca-sheet-body">{content}</div>
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}

/** Vinyl Record: a record sleeve with the disc sliding out; sections are the tracks, side A and B. */
export function Vinyl({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const ini = initials(c);
  const half = Math.ceil(ctx.sections.length / 2);
  const track = (i: number) => (i < half ? `A${i + 1}` : `B${i - half + 1}`);
  return (
    <div className="t-vnl">
      <header className="vnl-hero">
        <div className="vnl-record-wrap rise">
          <div className="vnl-disc" aria-hidden>
            <div className="vnl-label">
              <span className="d">
                {ini[0]}&amp;{ini[1]}
              </span>
              <span className="k">{db?.y ?? ""}</span>
            </div>
          </div>
          <div className="vnl-sleeve">
            <Art ctx={ctx} f={heroPiece(ctx, ["bouquet", "wreath", "frame"])} className="vnl-art" origin="bl" auto />
            <p className="d vnl-sleeve-title">
              {ctx.p1} &amp; {ctx.p2}
            </p>
          </div>
        </div>
        <div className="vnl-text">
          <p className="k">{c.headline || "Now playing"}</p>
          <h1 className="d vnl-names rise rise-2">
            {ctx.p1}
            <span className="s"> &amp; </span>
            {ctx.p2}
          </h1>
          <p className="k vnl-date">{db ? `Released ${db.month} ${Number(db.d)}, ${db.y}` : "Release date to be announced"}</p>
          {c.location && <p className="m">Recorded live in {c.location}</p>}
          <ol className="vnl-tracks">
            {ctx.sections.map((id, i) => (
              <li key={id}>
                <a href={`#${id}`}>
                  <span className="vnl-tn">{track(i)}</span>
                  <span>{title(ctx, id)}</span>
                </a>
              </li>
            ))}
          </ol>
          <Countdown date={c.date} className="vnl-count" />
        </div>
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <>
            {i === half && (
              <div className="vnl-flip">
                <p className="s">flip the record</p>
                <p className="k">Side B</p>
              </div>
            )}
            <section id={id} className="vnl-sec">
              <p className="d vnl-sec-no">{track(i)}</p>
              <div className="vnl-sec-body">
                <h2 className="d vnl-h">{title(ctx, id)}</h2>
                {content}
              </div>
            </section>
          </>
        )}
        custom={std(ctx)}
      />
      <footer className="vnl-foot">
        <p className="k">
          ℗ {db?.y ?? ""} {ctx.p1} &amp; {ctx.p2} · All rights reserved for the dance floor
        </p>
      </footer>
    </div>
  );
}

/** Storybook Spread: a cloth-bound book; every section is an open two-page spread. */
export function Spread({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "wreath", "frame", "elements"], 8);
  return (
    <div className="t-bk">
      <header className="bk-hero">
        <div className="bk-cover rise">
          <div className="bk-cover-in">
            <Art ctx={ctx} f={heroPiece(ctx, ["wreath", "frame"])} className="bk-cover-art" origin="tl" auto />
            <h1 className="bk-title">
              <span className="d">{ctx.p1}</span>
              <span className="s">&amp;</span>
              <span className="d">{ctx.p2}</span>
            </h1>
            <p className="k">{db ? `A story in ${ctx.sections.length} chapters · ${db.y}` : "A story in chapters"}</p>
          </div>
        </div>
        <div className="bk-hero-text">
          <p className="k">{c.headline || "Together with their families"}</p>
          <p className="d bk-tag">{c.tagline || "invite you to the next chapter"}</p>
          <p className="k bk-date">{db ? `${db.wd}, ${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
          {c.location && <p className="m">{c.location}</p>}
          <Countdown date={c.date} className="bk-count" />
          <Nav ctx={ctx} className="bk-nav" mark={(i) => `${ROMAN[i] ?? i + 1}.`} />
        </div>
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="bk-spread">
            <div className="bk-page bk-page--l">
              <p className="k">Chapter {ROMAN[i] ?? i + 1}</p>
              <h2 className="d bk-h">{title(ctx, id)}</h2>
              <Art ctx={ctx} f={art[(i + 1) % art.length]} className="bk-plate" origin="bl" />
              <span className="bk-folio">{i * 2 + 1}</span>
            </div>
            <div className="bk-page bk-page--r">
              {content}
              <span className="bk-folio">{i * 2 + 2}</span>
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="bk-end">
        <p className="s">The End</p>
        <p className="k m">…and the beginning</p>
      </footer>
    </div>
  );
}

/** Postage Stamp: your names on a perforated stamp with a postmark; each section carries its own stamp. */
export function Stamps({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "wreath", "elements"], 8);
  const ev = firstEvent(ctx);
  return (
    <div className="t-pst">
      <header className="pst-hero">
        <div className="pst-stamp pst-stamp--big rise">
          <div className="pst-stamp-in">
            <Art ctx={ctx} f={heroPiece(ctx, ["bouquet", "wreath"])} className="pst-art" origin="bl" auto />
            <p className="d pst-val">{db?.yy ?? "♥"}</p>
            <p className="k pst-country">Love Post</p>
          </div>
        </div>
        <div className="pst-postmark" aria-hidden>
          <span className="k">{c.location || "With love"}</span>
          <b className="d">{db ? `${db.d}·${db.m}·${db.y}` : "Soon"}</b>
        </div>
        <div className="pst-text">
          <p className="k">{c.headline || "Together with their families"}</p>
          <h1 className="pst-names rise rise-2">
            <span className="s">{ctx.p1}</span> <span className="d">&amp;</span> <span className="s">{ctx.p2}</span>
          </h1>
          <p className="k pst-date">{db ? `${db.wd}, ${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
          {ev?.venue && <p className="m">{ev.venue}</p>}
          <Countdown date={c.date} className="pst-count" />
        </div>
      </header>
      <Nav ctx={ctx} className="pst-nav" />
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="pst-sec">
            <div className="pst-letter">
              <div className="pst-stamp pst-stamp--sm" aria-hidden>
                <div className="pst-stamp-in">
                  <Art ctx={ctx} f={art[(i + 1) % art.length]} className="pst-art" origin="bl" />
                  <p className="d pst-val">{pad(i + 1)}</p>
                </div>
              </div>
              <h2 className="d pst-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}

/** Gift Tags: hand-tied tags on twine; each section hangs on its own tag. */
export function Tags({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "elements"], 8);
  return (
    <div className="t-tag">
      <header className="tg2-hero">
        <div className="tg2-tag tg2-tag--hero rise">
          <span className="tg2-hole" aria-hidden />
          <Art ctx={ctx} f={heroPiece(ctx, ["bouquet"])} className="tg2-art" origin="bl" auto />
          <p className="k">To: our favourite people</p>
          <h1 className="tg2-names">
            <span className="s">{ctx.p1}</span>
            <span className="d">&amp;</span>
            <span className="s">{ctx.p2}</span>
          </h1>
          <p className="k tg2-date">{db ? `${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
          {c.location && <p className="m">{c.location}</p>}
        </div>
        <Countdown date={c.date} className="tg2-count" />
        <Nav ctx={ctx} className="tg2-nav" />
      </header>
      <div className="tg2-line">
        <Sections
          ctx={ctx}
          decor={false}
          dividers={false}
          wrap={(id, i, content) => (
            <section id={id} className={`tg2-sec tg2-sec--${i % 3}`}>
              <div className="tg2-tag">
                <span className="tg2-hole" aria-hidden />
                {i % 2 === 0 && <Art ctx={ctx} f={art[(i + 1) % art.length]} className="tg2-sprig" origin="tr" />}
                <p className="k tg2-k">No. {pad(i + 1)}</p>
                <h2 className="s tg2-h">{title(ctx, id)}</h2>
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
