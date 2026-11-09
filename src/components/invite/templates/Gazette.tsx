import "./gazette.css";
import { dotDate, formalDate } from "@/lib/content";
import { CalendarLink, DirectionsLink, GalleryImg, HeroImg, MapEmbed, Prose, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { RsvpForm } from "../RsvpForm";
import { events, ROMAN, safeUrl, type Ctx } from "../ctx";

/** A vintage broadsheet front page announcing the wedding. */
export function Gazette({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const fd = formalDate(c.date);
  const year = c.date.slice(0, 4);
  const [first, ...rest] = c.story.body.split(/\n{2,}/);
  return (
    <div className="t-gz">
      <header className="gz-mast">
        <div className="gz-ears">
          <span>Late Edition</span>
          <span className="gz-ear-mid">“All the love that&rsquo;s fit to print”</span>
          <span>Price: Your Presence</span>
        </div>
        <h1 className="gz-title d">The Wedding Times</h1>
        <div className="gz-dateline">
          <span>Vol. I · No. 1</span>
          <span>{ctx.date || "Date to be announced"}</span>
          <span>{c.location || "Special Edition"}</span>
        </div>
      </header>

      <nav className="gz-nav">
        {ctx.sections.map((id) => (
          <a key={id} href={`#${id}`}>
            {title(ctx, id)}
          </a>
        ))}
      </nav>

      <section className="gz-front">
        <p className="gz-kicker">Exclusive · Society Pages</p>
        <h2 className="gz-headline d">
          {ctx.p1} &amp; {ctx.p2} to Wed
        </h2>
        <p className="gz-deck">
          {c.headline ? `${c.headline}, ` : ""}
          {ctx.p1} and {ctx.p2} {c.tagline || "invite you to celebrate their wedding"}
          {fd ? `, ${fd.weekday} ${fd.line}` : ""}
          {c.location ? ` in ${c.location}` : ""}.
        </p>

        <div className="gz-lead">
          <figure className="gz-photo">
            <HeroImg ctx={ctx} w={1400} />
            <figcaption>
              The happy couple, pictured ahead of the celebrations. <span className="gz-byline">Photograph: Vow Archive</span>
            </figcaption>
          </figure>
          <article className="gz-story">
            <p className="gz-by">By Our Society Correspondent</p>
            {c.story.body ? (
              <div className="gz-cols">
                <p className="gz-drop">{first}</p>
                {rest.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            ) : (
              <p className="gz-drop">Details of the romance remain closely guarded.</p>
            )}
          </article>
          <aside className="gz-side">
            <div className="gz-box">
              <p className="gz-box-k">Countdown</p>
              <Countdown date={c.date} className="gz-count" />
              <p className="gz-box-foot">until the big day</p>
            </div>
            <div className="gz-box">
              <p className="gz-box-k">In This Edition</p>
              <ol className="gz-index">
                {ctx.sections.map((id, i) => (
                  <li key={id}>
                    <a href={`#${id}`}>{title(ctx, id)}</a>
                    <span>{ROMAN[i]}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="gz-box gz-weather">
              <p className="gz-box-k">Forecast</p>
              <p>100% chance of happy tears. Light showers of confetti expected by evening.</p>
            </div>
          </aside>
        </div>
      </section>

      <Sections
        ctx={ctx}
        wrap={(id, i, content) =>
          id === "story" ? null : (
            <section id={id} className={`gz-sec gz-sec--${id}`}>
              <header className="gz-sec-head">
                <span>Section {ROMAN[i]}</span>
                <h2 className="d">{title(ctx, id)}</h2>
                <span>{dotDate(c.date)}</span>
              </header>
              {content}
            </section>
          )
        }
        custom={{
          details: () => (
            <>
              <div className="gz-notices">
                {events(c).map((e, i) => (
                  <article key={i} className="gz-notice">
                    <p className="gz-notice-k">Public Notice</p>
                    <h3 className="d">{e.title}</h3>
                    <p className="gz-notice-time">{e.time}</p>
                    <p>
                      <b>{e.venue}</b>
                    </p>
                    <p className="m">{e.address}</p>
                    <DirectionsLink e={e} className="gz-link">
                      Get directions →
                    </DirectionsLink>
                  </article>
                ))}
              </div>
              <div className="gz-row">
                <CalendarLink ctx={ctx} className="gz-link">
                  Clip &amp; save: add to your calendar →
                </CalendarLink>
              </div>
              <MapEmbed ctx={ctx} className="gz-map" />
            </>
          ),
          schedule: () => (
            <table className="gz-table">
              <tbody>
                {c.schedule.items.map((it, i) => (
                  <tr key={i}>
                    <td className="gz-t-time">{it.time}</td>
                    <td>
                      <b>{it.title}</b>
                      {it.detail && <span> · {it.detail}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ),
          gallery: () => (
            <div className="gz-photos">
              {ctx.gallery.map((src, i) => (
                <figure key={i}>
                  <GalleryImg src={src} w={700} />
                  <figcaption>Fig. {i + 1}. Scenes from the courtship, {year || "recently"}.</figcaption>
                </figure>
              ))}
            </div>
          ),
          faq: () => (
            <div className="gz-letters">
              {c.faq.items.map((f, i) => (
                <article key={i} className="gz-letter">
                  <p>
                    <i>Dear Editor,</i> {f.q}
                  </p>
                  <p className="gz-sign">A Curious Guest</p>
                  <p className="gz-reply">
                    <b>The couple replies:</b> {f.a}
                  </p>
                </article>
              ))}
            </div>
          ),
          registry: () => (
            <div className="gz-classifieds">
              <article className="gz-ad">
                <p className="gz-ad-k">Wanted</p>
                <Prose text={c.registry.body || "Your company. Nothing more required."} />
              </article>
              {c.registry.links.filter((l) => safeUrl(l.url)).map((l, i) => (
                <a key={i} className="gz-ad gz-ad-link" href={safeUrl(l.url)} target="_blank" rel="noopener noreferrer">
                  <p className="gz-ad-k">Classified</p>
                  <p className="d">{l.label || "Registry"}</p>
                  <p className="m">Inquire within →</p>
                </a>
              ))}
            </div>
          ),
          party: () => (
            <ul className="gz-whos">
              {c.party.members
                .filter((m) => m.name)
                .map((m, i) => (
                  <li key={i}>
                    <b>{m.name}</b>
                    <span>{m.role}</span>
                  </li>
                ))}
            </ul>
          ),
          rsvp: () => (
            <div className="gz-coupon">
              <p className="gz-cut">✂ — — — Cut along the dotted line — — —</p>
              <h3 className="d">Official Reply Coupon</h3>
              {c.rsvp.body && <p className="gz-coupon-body">{c.rsvp.body}</p>}
              <RsvpForm
                slug={ctx.slug}
                disabled={ctx.mode !== "live"}
                askMeal={c.rsvp.askMeal}
                mealOptions={c.rsvp.mealOptions}
                maxGuests={c.rsvp.maxGuests}
                submitLabel="Send to the Editor"
              />
            </div>
          ),
          travel: () => <Prose className="gz-cols gz-cols--2" text={c.travel.body} />,
        }}
      />

      <footer className="gz-foot">
        <p className="d">The Wedding Times</p>
        <p>
          Printed with love for {ctx.p1} &amp; {ctx.p2} · {ctx.date}
        </p>
      </footer>
    </div>
  );
}
