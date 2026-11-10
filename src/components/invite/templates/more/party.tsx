import "./party.css";
import type { SectionId } from "@/lib/content";
import { GalleryImg, Sections } from "../../blocks";
import { Countdown } from "../../Countdown";
import type { Ctx } from "../../ctx";
import { Art, dateBits, firstEvent, heroPiece, initials, Nav, photo, pickArt, std, title } from "./kit";
import { floralUrl } from "@/lib/assets";

const pad = (n: number) => String(n).padStart(2, "0");

/** Countdown: giant flip-clock tiles counting down to the day; each section gets a little flip tile. */
export function FlipClock({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  return (
    <div className="t-fc">
      <header className="fc-hero">
        <p className="k fc-k">Counting down to</p>
        <h1 className="d fc-names rise">
          {ctx.p1} <span className="s">&amp;</span> {ctx.p2}
        </h1>
        <Countdown date={c.date} className="fc-clock" />
        {!db && <p className="d fc-tba">Date coming soon</p>}
        <p className="k fc-date">
          {db ? `${db.wd} · ${db.month} ${Number(db.d)} · ${db.y}` : ""}
          {c.location ? ` · ${c.location}` : ""}
        </p>
        <Art ctx={ctx} f={heroPiece(ctx, ["bouquet", "corner"])} className="fc-art" origin="br" auto delay={400} />
        <Nav ctx={ctx} className="fc-nav" />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="fc-sec">
            <div className="fc-tile" aria-hidden>
              <span className="d">{pad(i + 1)}</span>
            </div>
            <div className="fc-body">
              <h2 className="d fc-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}

/** Zine: a hand-made photocopied zine; high-contrast photos, highlighter, cut-out headings at angles. */
export function Zine({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "elements"], 6);
  return (
    <div className="t-zn">
      <header className="zn-hero">
        <p className="zn-issue">
          Issue #{db ? `${db.m}${db.d}` : "01"} · {db?.y ?? "soon"} · free
        </p>
        <h1 className="zn-names">
          <span className="zn-cut zn-cut--a d">{ctx.p1}</span>
          <span className="zn-cut zn-cut--b s">&amp;</span>
          <span className="zn-cut zn-cut--c d">{ctx.p2}</span>
        </h1>
        <div className="zn-photos">
          <GalleryImg src={photo(ctx, 0)} w={700} eager className="zn-ph zn-ph--a" />
          <GalleryImg src={photo(ctx, 1)} w={600} eager className="zn-ph zn-ph--b" />
          <Art ctx={ctx} f={art[0]} className="zn-art" origin="bl" auto delay={300} />
        </div>
        <p className="zn-head">
          <mark>are getting married</mark> {db ? `${db.month} ${Number(db.d)}` : "soon"}
          {c.location ? ` in ${c.location}` : ""}!!
        </p>
        <Countdown date={c.date} className="zn-count" />
        <Nav ctx={ctx} className="zn-nav" mark={(i) => `p${i + 2}`} />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className={`zn-sec zn-sec--${i % 3}`}>
            <h2 className="zn-h">
              <span className="d">{title(ctx, id)}</span>
            </h2>
            <p className="zn-page">p.{i + 2}</p>
            <div className="zn-body">{content}</div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="zn-foot">
        <p className="d">
          xo, {initials(c)[0]} + {initials(c)[1]}
        </p>
      </footer>
    </div>
  );
}

/** Welcome Sign: clear acrylic signs with script lettering, standing over a painted pattern. */
export function Sign({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const pattern = pickArt(ctx, ["pattern"], 1)[0];
  const art = pickArt(ctx, ["bouquet", "corner"], 6);
  const bg = pattern ? ({ ["--pat" as string]: `url("${floralUrl(pattern.id)}")` } as React.CSSProperties) : undefined;
  return (
    <div className="t-sg" style={bg}>
      <header className="sg-hero">
        <div className="sg-board rise">
          <Art ctx={ctx} f={heroPiece(ctx, ["bouquet", "corner"])} className="sg-posy" origin="tl" auto delay={400} />
          <p className="s sg-welcome">Welcome</p>
          <p className="k">to the wedding of</p>
          <h1 className="sg-names">
            <span className="d">{ctx.p1}</span>
            <span className="s">&amp;</span>
            <span className="d">{ctx.p2}</span>
          </h1>
          <p className="k sg-date">{db ? `${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
          {c.location && <p className="sg-loc">{c.location}</p>}
          <Countdown date={c.date} className="sg-count" />
        </div>
        <Nav ctx={ctx} className="sg-nav" />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="sg-sec">
            <div className={`sg-board sg-board--sec ${i % 2 ? "sg-board--arch" : ""}`}>
              {i % 3 === 2 && <Art ctx={ctx} f={art[(i + 1) % art.length]} className="sg-corner" origin="tr" />}
              <h2 className="s sg-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}

/** Escort Cards: a table of folded place cards; every section is a card with its table number. */
export function Escort({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "elements"], 8);
  return (
    <div className="t-ec">
      <header className="ec-hero">
        <p className="k">{c.headline || "Together with their families"}</p>
        <h1 className="ec-names rise">
          <span className="s">{ctx.p1}</span> <span className="d">&amp;</span> <span className="s">{ctx.p2}</span>
        </h1>
        <p className="k ec-date">{db ? `${db.wd} · ${db.month} ${Number(db.d)} · ${db.y}` : "Date to be announced"}</p>
        {c.location && <p className="m">{c.location}</p>}
        <Countdown date={c.date} className="ec-count" />
        <p className="ec-find">Please find your seat</p>
        <div className="ec-table">
          {ctx.sections.map((id, i) => (
            <a key={id} href={`#${id}`} className="ec-tent">
              <span className="k">Table {i + 1}</span>
              <span className="s">{title(ctx, id)}</span>
            </a>
          ))}
        </div>
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="ec-sec">
            <div className="ec-card">
              <div className="ec-card-top">
                <Art ctx={ctx} f={art[(i + 1) % art.length]} className="ec-sprig" origin="tl" />
                <p className="k">Table {i + 1}</p>
                <h2 className="s ec-h">{title(ctx, id)}</h2>
              </div>
              <div className="ec-card-body">{content}</div>
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}

/** Planner: a ring-bound wedding planner; colour tabs down the edge, dot-grid pages for each section. */
export function Planner({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const n = ctx.sections.length;
  return (
    <div className="t-pl">
      <header className="pl-hero">
        <div className="pl-cover rise">
          <span className="pl-band" aria-hidden />
          <Art ctx={ctx} f={heroPiece(ctx, ["wreath", "bouquet"])} className="pl-art" origin="tl" auto />
          <p className="k">The wedding planner of</p>
          <h1 className="pl-names">
            <span className="s">{ctx.p1}</span>
            <span className="d">&amp;</span>
            <span className="s">{ctx.p2}</span>
          </h1>
          <p className="k pl-date">{db ? `${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
        </div>
        <div className="pl-index">
          <p className="k m">Contents</p>
          <ol>
            {ctx.sections.map((id, i) => (
              <li key={id} style={{ ["--hue" as string]: `${(i / n) * 100}%` }}>
                <a href={`#${id}`}>
                  <span className="pl-dot" aria-hidden />
                  {title(ctx, id)}
                  <span className="m">{pad(i + 1)}</span>
                </a>
              </li>
            ))}
          </ol>
          {c.location && <p className="m pl-loc">{c.location}</p>}
          <Countdown date={c.date} className="pl-count" />
        </div>
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="pl-page" style={{ ["--hue" as string]: `${(i / n) * 100}%`, ["--tab" as string]: `${(i % 6) * 3.4 + 2}rem` }}>
            <span className="pl-tab" aria-hidden>
              {title(ctx, id)}
            </span>
            <div className="pl-head">
              <span className="k">
                Section {pad(i + 1)} / {pad(n)}
              </span>
              <h2 className="d pl-h">{title(ctx, id)}</h2>
            </div>
            {content}
          </section>
        )}
        custom={std(ctx)}
      />
    </div>
  );
}

/** Journey: a dotted route winds down the page from pin to pin, like a hand-drawn treasure map. */
export function Journey({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "elements", "wreath"], 8);
  return (
    <div className="t-jr">
      <header className="jr-hero">
        <Art ctx={ctx} f={heroPiece(ctx, ["bouquet", "wreath"])} className="jr-art" origin="tl" auto />
        <p className="k">The road to forever</p>
        <h1 className="jr-names rise">
          <span className="s">{ctx.p1}</span> <span className="d">&amp;</span> <span className="s">{ctx.p2}</span>
        </h1>
        <p className="k jr-date">{db ? `Destination: ${db.month} ${Number(db.d)}, ${db.y}` : "Destination date to be announced"}</p>
        {c.location && <p className="m">{c.location}</p>}
        <Countdown date={c.date} className="jr-count" />
        <span className="jr-pin jr-pin--start" aria-hidden>
          ★
        </span>
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className={`jr-stop ${i % 2 ? "jr-stop--r" : ""}`}>
            <svg className="jr-path" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
              <path d={i % 2 ? "M30 0 C 30 25, 70 15, 70 40" : "M70 0 C 70 25, 30 15, 30 40"} />
            </svg>
            <div className="jr-card">
              <span className="jr-pin" aria-hidden>
                {i + 1}
              </span>
              <p className="k jr-k">Stop {i + 1}</p>
              <h2 className="d jr-h">{title(ctx, id)}</h2>
              {i % 3 === 0 && <Art ctx={ctx} f={art[(i + 1) % art.length]} className="jr-sprig" origin="tr" />}
              {content}
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="jr-end">
        <span className="jr-pin" aria-hidden>
          ♥
        </span>
        <p className="s">You have arrived</p>
      </footer>
    </div>
  );
}

const SERVICE: Partial<Record<SectionId, [string, string]>> = {
  story: ["The House History", "101"],
  details: ["Reception Desk", "Lobby"],
  schedule: ["Daily Programme", "102"],
  party: ["Our Staff", "103"],
  gallery: ["The Gallery", "104"],
  music: ["The Music Room", "105"],
  travel: ["Arrivals", "Lobby"],
  dressCode: ["Wardrobe", "106"],
  registry: ["Gift Shop", "107"],
  faq: ["Concierge", "Desk"],
  wishes: ["Guest Book", "108"],
  rsvp: ["Reservations", "Desk"],
};

/** Grand Hotel: boutique-hotel stationery; a letterhead, a room key, and every section a hotel service. */
export function Hotel({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const ini = initials(c);
  const ev = firstEvent(ctx);
  return (
    <div className="t-ht">
      <header className="ht-hero">
        <div className="ht-letterhead rise">
          <div className="ht-crest" aria-hidden>
            <span className="d">
              {ini[0]}
              {ini[1]}
            </span>
          </div>
          <p className="k">Est. {db?.y ?? ""}</p>
          <h1 className="d ht-name">
            Hotel {ctx.p1} &amp; {ctx.p2}
          </h1>
          <p className="ht-addr">{[ev?.venue, c.location].filter(Boolean).join(" · ") || "Address to be announced"}</p>
          <p className="k ht-check">{db ? `Check-in ${db.wd}, ${db.month} ${Number(db.d)} · Check-out never` : "Check-in date to be announced"}</p>
        </div>
        <div className="ht-key rise rise-2" aria-hidden>
          <span className="ht-key-hole" />
          <span className="k">Room</span>
          <b className="d">{db ? `${Number(db.d)}${db.m}` : "1"}</b>
          <span className="k">
            {ini[0]} &amp; {ini[1]}
          </span>
        </div>
        <Countdown date={c.date} className="ht-count" labels={["Nights", "Hours", "Minutes"]} />
      </header>
      <nav className="ht-directory">
        <p className="k">Directory</p>
        {ctx.sections.map((id, i) => (
          <a key={id} href={`#${id}`}>
            <span>{SERVICE[id]?.[0] ?? title(ctx, id)}</span>
            <i />
            <span className="m">{SERVICE[id]?.[1] ?? String(109 + i)}</span>
          </a>
        ))}
      </nav>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="ht-sec">
            <div className="ht-sec-head">
              <p className="k">{SERVICE[id]?.[0] ?? "Guest services"}</p>
              <p className="ht-room">{SERVICE[id]?.[1] ?? String(109 + i)}</p>
            </div>
            <div className="ht-sec-body">
              <h2 className="d ht-h">{title(ctx, id)}</h2>
              {content}
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="ht-foot">
        <p className="k">Please do not disturb · Newlyweds</p>
      </footer>
    </div>
  );
}

/** Notebook: a lined notebook with a red margin; headings handwritten, photos clipped to the page. */
export function Notebook({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = pickArt(ctx, ["bouquet", "elements"], 6);
  return (
    <div className="t-nb">
      <div className="nb-paper">
        <header className="nb-hero">
          <p className="nb-dateline">{db ? `${db.wd}, ${db.month} ${Number(db.d)}, ${db.y}` : "Someday soon"}</p>
          <h1 className="s nb-names rise">
            {ctx.p1} + {ctx.p2}
          </h1>
          <p className="nb-line">
            {c.tagline || "are getting married"}
            {c.location ? `, in ${c.location}` : ""}! ♡
          </p>
          <Art ctx={ctx} f={art[0]} className="nb-doodle" origin="tr" auto delay={300} />
          <figure className="nb-clip">
            <GalleryImg src={photo(ctx, 0)} w={600} eager />
          </figure>
          <Countdown date={c.date} className="nb-count" />
          <ul className="nb-todo">
            {ctx.sections.map((id) => (
              <li key={id}>
                <a href={`#${id}`}>☐ {title(ctx, id)}</a>
              </li>
            ))}
          </ul>
        </header>
        <Sections
          ctx={ctx}
          decor={false}
          dividers={false}
          wrap={(id, i, content) => (
            <section id={id} className="nb-sec">
              <h2 className="s nb-h">
                {i + 1}. {title(ctx, id)}
              </h2>
              {i % 4 === 2 && <Art ctx={ctx} f={art[(i + 1) % art.length]} className="nb-margin-art" origin="tl" />}
              <div className="nb-body">{content}</div>
            </section>
          )}
          custom={std(ctx)}
        />
      </div>
    </div>
  );
}

/** Card Fan: three cards fanned in your hand, then a pinboard of cards for every section. */
export function CardFan({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const ev = firstEvent(ctx);
  const art = pickArt(ctx, ["bouquet", "wreath", "elements"], 8);
  return (
    <div className="t-cf">
      <header className="cf-hero">
        <div className="cf-hand">
          <div className="cf-card cf-card--l">
            <Art ctx={ctx} f={art[1 % art.length]} className="cf-art" origin="bl" auto delay={600} />
            <p className="k">Save the date</p>
          </div>
          <div className="cf-card cf-card--r">
            <p className="k">Where</p>
            <p className="d">{ev?.venue || "To be announced"}</p>
            {c.location && <p className="m">{c.location}</p>}
            {ev?.formal && <p className="m">{ev.formal}</p>}
          </div>
          <div className="cf-card cf-card--c rise">
            <Art ctx={ctx} f={heroPiece(ctx, ["wreath", "bouquet"])} className="cf-wreath" origin="tl" auto />
            <h1 className="cf-names">
              <span className="s">{ctx.p1}</span>
              <span className="d">&amp;</span>
              <span className="s">{ctx.p2}</span>
            </h1>
            <p className="k cf-date">{db ? `${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
          </div>
        </div>
        <Countdown date={c.date} className="cf-count" />
        <Nav ctx={ctx} className="cf-nav" />
      </header>
      <div className="cf-board">
        <Sections
          ctx={ctx}
          decor={false}
          dividers={false}
          wrap={(id, i, content) => (
            <section id={id} className={`cf-pin cf-pin--${i % 4} ${id === "rsvp" || id === "gallery" || id === "details" ? "cf-pin--wide" : ""}`}>
              <h2 className="d cf-h">{title(ctx, id)}</h2>
              {content}
            </section>
          )}
          custom={std(ctx)}
        />
      </div>
    </div>
  );
}
