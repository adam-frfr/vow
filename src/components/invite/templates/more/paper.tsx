import "./paper.css";
import type { SectionId } from "@/lib/content";
import { Sections } from "../../blocks";
import { Countdown } from "../../Countdown";
import type { Ctx } from "../../ctx";
import { Art, dateBits, firstEvent, heroPiece, initials, Nav, pickArt, ROMAN, std, title } from "./kit";

const COURSES = ["Apéritif", "First Course", "Second Course", "Third Course", "Fourth Course", "Fifth Course", "Sixth Course", "Seventh Course", "Eighth Course", "Ninth Course", "Tenth Course", "Eleventh Course", "Twelfth Course"];

/** Dinner Menu: one long menu card, each section a course. */
export function Menu({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const sprigs = pickArt(ctx, ["bouquet", "elements"], 4);
  const db = dateBits(c);
  return (
    <div className="t-menu">
      <div className="mn-card">
        <header className="mn-hero">
          <Art ctx={ctx} f={heroPiece(ctx, ["bouquet"])} className="mn-crown" origin="tl" auto />
          <p className="k m rise">{c.headline || "The wedding of"}</p>
          <h1 className="mn-names rise rise-2">
            <span className="s">{ctx.p1}</span>
            <span className="d mn-amp">&amp;</span>
            <span className="s">{ctx.p2}</span>
          </h1>
          <p className="d mn-title rise rise-3">Menu</p>
          <p className="k mn-date rise rise-4">{db ? `${db.wd} · ${db.month} ${Number(db.d)} · ${db.y}` : "Date to be announced"}</p>
          {c.location && <p className="m mn-loc">{c.location}</p>}
          <ol className="mn-toc">
            {ctx.sections.map((id, i) => (
              <li key={id}>
                <a href={`#${id}`}>
                  <span>{title(ctx, id)}</span>
                  <i />
                  <span className="m">{COURSES[i % COURSES.length]}</span>
                </a>
              </li>
            ))}
          </ol>
          <Countdown date={c.date} className="mn-count" />
        </header>
        <Sections
          ctx={ctx}
          decor={false}
          dividers={false}
          wrap={(id, i, content) => (
            <section id={id} className={`mn-sec mn-sec--${id}`}>
              <Art ctx={ctx} f={sprigs[i % sprigs.length]} className="mn-sprig" origin={i % 2 ? "tl" : "tr"} />
              <p className="k mn-course">{COURSES[i % COURSES.length]}</p>
              <h2 className="d mn-h">{title(ctx, id)}</h2>
              <div className="mn-body">{content}</div>
            </section>
          )}
          custom={std(ctx)}
        />
        <footer className="mn-foot">
          <p className="s">Bon appétit</p>
          <p className="k m">
            {initials(c)[0]} · {initials(c)[1]}
          </p>
        </footer>
      </div>
    </div>
  );
}

/** Ceremony Programme: a folded booklet; cover + order of the day, then numbered pages with running heads. */
export function Programme({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const wreath = heroPiece(ctx, ["wreath", "frame"]);
  const ev = firstEvent(ctx);
  const db = dateBits(c);
  return (
    <div className="t-prog">
      <header className="pg-spread">
        <div className="pg-cover">
          <Art ctx={ctx} f={wreath} className="pg-wreath" origin="tl" auto />
          <div className="pg-cover-text">
            <p className="k rise">The marriage of</p>
            <h1 className="pg-names rise rise-2">
              <span className="d">{ctx.p1}</span>
              <span className="s pg-and">and</span>
              <span className="d">{ctx.p2}</span>
            </h1>
            <p className="k pg-date rise rise-3">{db ? `${db.month} ${Number(db.d)}, ${db.y}` : "Date to be announced"}</p>
          </div>
        </div>
        <div className="pg-order">
          <p className="k m">Order of the day</p>
          <ol>
            {ctx.sections.map((id, i) => (
              <li key={id}>
                <a href={`#${id}`}>
                  <span className="pg-no">{String(i + 1).padStart(2, "0")}</span>
                  <span className="d">{title(ctx, id)}</span>
                </a>
              </li>
            ))}
          </ol>
          {ev?.venue && (
            <p className="pg-venue">
              {ev.venue}
              {ev.formal && <span className="m"> · {ev.formal}</span>}
            </p>
          )}
          <Countdown date={c.date} className="pg-count" />
        </div>
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="pg-page">
            <div className="pg-run">
              <span>
                {ctx.p1} &amp; {ctx.p2}
              </span>
              <span>{title(ctx, id)}</span>
            </div>
            <h2 className="d pg-h">
              <span className="pg-h-no">{ROMAN[i] ?? i + 1}.</span> {title(ctx, id)}
            </h2>
            <div className="pg-body">{content}</div>
            <p className="pg-folio">{i + 2}</p>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="pg-back">
        <p className="s">With love and thanks</p>
      </footer>
    </div>
  );
}

const RECIPE: Partial<Record<SectionId, string>> = { story: "Ingredients", details: "Where to cook", schedule: "Method", party: "Our helpers", gallery: "Serving suggestions", travel: "Getting to the kitchen", dressCode: "Presentation", registry: "Pantry wishes", faq: "Chef's notes", wishes: "Reviews", rsvp: "Reserve a seat", music: "Kitchen playlist" };

/** Recipe Card: the wedding written on ruled kitchen index cards. */
export function Recipe({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const posy = pickArt(ctx, ["bouquet", "elements"], 6);
  const db = dateBits(c);
  return (
    <div className="t-rc">
      <header className="rc-hero">
        <div className="rc-card rc-card--hero rise">
          <Art ctx={ctx} f={posy[0]} className="rc-posy" origin="tr" auto />
          <p className="rc-field">
            <b>Recipe for</b> <span className="s">a happy marriage</span>
          </p>
          <p className="rc-field">
            <b>From the kitchen of</b>
          </p>
          <h1 className="s rc-names">
            {ctx.p1} &amp; {ctx.p2}
          </h1>
          <p className="rc-field">
            <b>Ready on</b> <span>{db ? `${db.wd}, ${db.month} ${Number(db.d)}, ${db.y}` : "a date to be announced"}</span>
          </p>
          {c.location && (
            <p className="rc-field">
              <b>Kitchen</b> <span>{c.location}</span>
            </p>
          )}
          <p className="rc-field">
            <b>Serves</b> <span>all our favourite people</span>
          </p>
        </div>
        <Countdown date={c.date} className="rc-count" />
        <Nav ctx={ctx} className="rc-nav" />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className={`rc-sec ${i % 2 ? "rc-sec--r" : ""}`}>
            <div className="rc-card">
              <Art ctx={ctx} f={posy[(i + 1) % posy.length]} className="rc-posy rc-posy--sm" origin="tr" />
              <p className="rc-field">
                <b>{RECIPE[id] ?? "Step"}</b> <span className="m">no. {i + 1}</span>
              </p>
              <h2 className="s rc-h">{title(ctx, id)}</h2>
              <div className="rc-body">{content}</div>
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="rc-foot">
        <p className="s">Made with love</p>
      </footer>
    </div>
  );
}

/** Telegram: urgent good news, typed in capitals, every section a numbered wire. */
export function Telegram({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const ev = firstEvent(ctx);
  const msg = [`${ctx.p1} AND ${ctx.p2} ARE GETTING MARRIED`, db ? `${db.wd} ${db.month} ${Number(db.d)} ${db.y}` : "DATE TO FOLLOW", ev?.venue, c.location, "YOUR PRESENCE REQUESTED", "LOVE"].filter(Boolean);
  return (
    <div className="t-tg">
      <header className="tg-hero">
        <div className="tg-form rise">
          <div className="tg-head">
            <p className="d tg-word">Telegram</p>
            <p className="tg-meta">
              No. {db ? `${db.y}${db.m}${db.d}` : "0001"}
              <br />
              Priority · Joyful
            </p>
          </div>
          <dl className="tg-fields">
            <div>
              <dt>To</dt>
              <dd>Our dearest family &amp; friends</dd>
            </div>
            <div>
              <dt>From</dt>
              <dd>
                {ctx.p1} &amp; {ctx.p2}
              </dd>
            </div>
          </dl>
          <p className="tg-strip">
            {msg.map((m, i) => (
              <span key={i}>
                {String(m).toUpperCase()} <b>STOP</b>{" "}
              </span>
            ))}
          </p>
          <Countdown date={c.date} className="tg-count" labels={["Days", "Hrs", "Mins"]} />
        </div>
        <Nav ctx={ctx} className="tg-nav" mark={(i) => `${String(i + 1).padStart(2, "0")}`} />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="tg-sec">
            <div className="tg-form">
              <div className="tg-head tg-head--sm">
                <p className="tg-meta">Wire {String(i + 2).padStart(3, "0")}</p>
                <h2 className="d tg-h">{title(ctx, id)}</h2>
              </div>
              <div className="tg-body">{content}</div>
              <p className="tg-stop">STOP</p>
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="tg-foot">
        <p className="tg-strip">
          SEE YOU THERE <b>STOP</b> {initials(c).join(" + ")} <b>END</b>
        </p>
      </footer>
    </div>
  );
}

/** Admit One: a ticket for every part of the day, with a tear-off stub. */
export function Ticket({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const ev = firstEvent(ctx);
  const art = heroPiece(ctx, ["bouquet", "wreath", "frame"]);
  return (
    <div className="t-tk">
      <header className="tk-hero">
        <div className="tk-ticket tk-ticket--hero rise">
          <div className="tk-main">
            <p className="k">Admit one · A wedding</p>
            <h1 className="tk-names">
              <span className="d">{ctx.p1}</span>
              <span className="s tk-amp">&amp;</span>
              <span className="d">{ctx.p2}</span>
            </h1>
            <div className="tk-grid">
              <div>
                <span className="k">Date</span>
                <b>{db ? `${db.mon} ${Number(db.d)}` : "TBA"}</b>
              </div>
              <div>
                <span className="k">Year</span>
                <b>{db?.y ?? "—"}</b>
              </div>
              <div>
                <span className="k">Doors</span>
                <b>{ev?.time || "TBA"}</b>
              </div>
              <div>
                <span className="k">Seat</span>
                <b>Yours</b>
              </div>
            </div>
            <p className="tk-venue">{[ev?.venue, c.location].filter(Boolean).join(" · ")}</p>
          </div>
          <div className="tk-stub">
            <Art ctx={ctx} f={art} className="tk-art" origin="bl" auto />
            <p className="tk-stub-no">No. {db ? `${db.d}${db.m}` : "001"}</p>
          </div>
        </div>
        <Countdown date={c.date} className="tk-count" />
        <Nav ctx={ctx} className="tk-nav" />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className="tk-sec">
            <div className="tk-ticket">
              <div className="tk-main">
                <h2 className="d tk-h">{title(ctx, id)}</h2>
                <div className="tk-body">{content}</div>
              </div>
              <div className="tk-stub tk-stub--side">
                <p className="k">Part</p>
                <p className="d tk-part">{String(i + 1).padStart(2, "0")}</p>
              </div>
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="tk-foot">
        <p className="k">Keep this ticket · Non-transferable · Full of love</p>
      </footer>
    </div>
  );
}

const LABEL: Partial<Record<SectionId, string>> = { story: "Tasting notes", details: "Cellar & service", schedule: "Pairings", party: "The growers", gallery: "From the vineyard", travel: "Directions to the estate", dressCode: "Presentation", registry: "The cellar list", faq: "Sommelier's notes", wishes: "Reviews", rsvp: "Reserve a bottle", music: "Ambience" };

/** Wine Label: the hero is a bottle label (vintage, appellation), sections are back-label panels. */
export function WineLabel({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const db = dateBits(c);
  const art = heroPiece(ctx, ["bouquet", "wreath"]);
  const ini = initials(c);
  return (
    <div className="t-wl">
      <header className="wl-hero">
        <div className="wl-label rise">
          <p className="k wl-estate">Estate bottled · {ini[0]} &amp; {ini[1]}</p>
          <Art ctx={ctx} f={art} className="wl-art" origin="bl" auto delay={200} />
          <p className="s wl-cuvee">Cuvée</p>
          <h1 className="d wl-names">
            {ctx.p1} &amp; {ctx.p2}
          </h1>
          <p className="wl-vintage">
            <span className="k">Vintage</span>
            <b className="d">{db?.y ?? "—"}</b>
          </p>
          <p className="k wl-app">{c.location ? `Appellation ${c.location}` : "Appellation d'amour"}</p>
          <p className="wl-small">{db ? `Uncorked ${db.wd}, ${db.month} ${Number(db.d)}` : "Uncorking date to be announced"} · 750 ml of joy</p>
        </div>
        <Countdown date={c.date} className="wl-count" />
        <Nav ctx={ctx} className="wl-nav" />
      </header>
      <Sections
        ctx={ctx}
        decor={false}
        dividers={false}
        wrap={(id, i, content) => (
          <section id={id} className={`wl-sec ${i % 2 ? "wl-sec--r" : ""}`}>
            <div className="wl-panel">
              <p className="k wl-k">{LABEL[id] ?? "From the estate"}</p>
              <h2 className="d wl-h">{title(ctx, id)}</h2>
              <div className="wl-body">{content}</div>
            </div>
          </section>
        )}
        custom={std(ctx)}
      />
      <footer className="wl-foot">
        <p className="s">Santé</p>
        <p className="k m">Best enjoyed together</p>
      </footer>
    </div>
  );
}
