import "./stationery.css";
import { formalDate, formalTime, formatDate } from "@/lib/content";
import { img } from "@/lib/themes";
import { CalendarLink, Credit, DirectionsLink, MapEmbed, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { RsvpForm } from "../RsvpForm";
import { events, type Ctx } from "../ctx";

const CARD_NAME: Partial<Record<string, string>> = {
  details: "The Details Card",
  schedule: "The Order of the Day",
  travel: "Accommodations",
  rsvp: "The Reply Card",
  registry: "Gift Card",
  faq: "Notes for Guests",
  dressCode: "Attire",
  wishes: "The Guestbook",
};

/** A layered invitation suite resting on an envelope-liner backdrop. */
export function Stationery({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const fd = formalDate(c.date);
  const ceremony = events(c)[0];
  const liner = img(ctx.hero, 2000);
  return (
    <div className="t-st" style={{ ["--liner" as string]: `url("${liner}")` }}>
      <div className="st-liner" aria-hidden style={{ filter: ctx.heroFilter }} />

      <header className="st-hero">
        <div className="st-stack">
          <div className="st-card st-card--back st-card--b1">
            <span className="k">Reception to follow</span>
          </div>
          <div className="st-card st-card--back st-card--b2">
            <span className="k">Kindly reply</span>
          </div>
          <article className="st-card st-card--main rise">
            <p className="st-host">{c.headline || "Together with their families"}</p>
            <h1 className="st-names">
              <span className="d">{ctx.p1}</span>
              <span className="s st-and">and</span>
              <span className="d">{ctx.p2}</span>
            </h1>
            <p className="st-req">{c.tagline || "request the honour of your presence at their marriage"}</p>
            {fd ? (
              <p className="st-when">
                {fd.weekday}, {fd.line}
                <br />
                {fd.year}
                {ceremony?.time ? (
                  <>
                    <br />
                    at {formalTime(ceremony.time)}
                  </>
                ) : null}
              </p>
            ) : (
              <p className="st-when">Date to be announced</p>
            )}
            {ceremony?.venue && <p className="st-where">{ceremony.venue}</p>}
            {c.location && <p className="st-city">{c.location}</p>}
          </article>
        </div>
        <Countdown date={c.date} className="st-count" />
        <Credit ctx={ctx} className="st-credit" />
      </header>

      <div className="st-suite">
        <Sections
          ctx={ctx}
          wrap={(id, _i, content) => (
            <section id={id} className={`st-card st-sec st-sec--${id}`}>
              <p className="st-tab">{CARD_NAME[id] ?? "Enclosure"}</p>
              <h2 className="d st-h">{title(ctx, id)}</h2>
              <div className="st-rule" />
              {content}
            </section>
          )}
          custom={{
            details: () => (
              <>
                <div className="st-events">
                  {events(c).map((e, i) => (
                    <div key={i} className="st-event">
                      <p className="k">{e.title}</p>
                      <p className="d st-event-venue">{e.venue}</p>
                      <p>{e.time}</p>
                      <p className="m">{e.address}</p>
                      <DirectionsLink e={e} className="st-link" />
                    </div>
                  ))}
                </div>
                <div className="st-center">
                  <CalendarLink ctx={ctx} className="st-link" />
                </div>
                <MapEmbed ctx={ctx} className="st-map" />
              </>
            ),
            schedule: () => (
              <dl className="st-order">
                {c.schedule.items.map((it, i) => (
                  <div key={i}>
                    <dt>{it.time}</dt>
                    <dd>
                      <span className="d">{it.title}</span>
                      {it.detail && <span className="m"> · {it.detail}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            ),
            rsvp: () => (
              <div className="st-reply">
                <p className="st-reply-by">
                  {c.rsvp.deadline ? `The favour of a reply is requested by ${formatDate(c.rsvp.deadline, "short")}` : "The favour of a reply is requested"}
                </p>
                <RsvpForm
                  slug={ctx.slug}
                  disabled={ctx.mode !== "live"}
                  askMeal={c.rsvp.askMeal}
                  mealOptions={c.rsvp.mealOptions}
                  maxGuests={c.rsvp.maxGuests}
                  submitLabel="Return reply card"
                  yesLabel="Accepts with pleasure"
                  noLabel="Declines with regret"
                />
              </div>
            ),
          }}
        />
      </div>

      <footer className="st-foot">
        <p className="s">
          {ctx.p1} &amp; {ctx.p2}
        </p>
      </footer>
    </div>
  );
}
