import "./voyage.css";
import { formatDate, initials } from "@/lib/content";
import { img } from "@/lib/themes";
import { CalendarLink, DirectionsLink, GalleryImg, MapEmbed, Prose, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { RsvpForm } from "../RsvpForm";
import { events, type Ctx } from "../ctx";

const CAPTIONS = ["Wish you were here", "Adventures", "Us, always", "Next stop: forever", "Postcard from home", "Golden hour"];

/** Travel architecture: large-letter postcard, boarding pass, itinerary. */
export function Voyage({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const place = (c.location.split(",")[0] || "Paradise").trim();
  const ceremony = events(c)[0];
  const code = `${initials(c).join("")}${c.date.slice(2, 4) || "26"}`;
  const heroUrl = img(ctx.hero, 2000);
  return (
    <div className="t-vy">
      <nav className="vy-nav">
        <span className="vy-brand">
          {ctx.p1} &amp; {ctx.p2}
        </span>
        <span className="vy-links">
          {ctx.sections.slice(0, 4).map((id) => (
            <a key={id} href={`#${id}`}>
              {title(ctx, id)}
            </a>
          ))}
        </span>
      </nav>

      <header className="vy-hero" style={{ ["--hero-url" as string]: `url("${heroUrl}")` }}>
        <div className="vy-hero-bg" style={{ filter: ctx.heroFilter }} />
        <div className="vy-hero-copy">
          <p className="s vy-greet rise">Greetings from</p>
          <h1 className="vy-big rise rise-2" aria-label={place}>
            {place}
          </h1>
          <p className="vy-sub rise rise-3">
            The wedding of {ctx.p1} &amp; {ctx.p2}
          </p>
        </div>
        <div className="vy-stamp rise rise-4">
          <span>Postmarked</span>
          <b className="d">{c.date ? formatDate(c.date, "short") : "Soon"}</b>
          <span>{place}</span>
        </div>
      </header>

      <section className="vy-pass-wrap" id="pass">
        <div className="vy-pass">
          <div className="vy-pass-main">
            <div className="vy-pass-head">
              <span className="d">Boarding Pass</span>
              <span>Vow Air · First Class</span>
            </div>
            <div className="vy-pass-grid">
              <div>
                <span>Passenger</span>
                <b>Our favourite people</b>
              </div>
              <div>
                <span>Flight</span>
                <b>{code}</b>
              </div>
              <div className="vy-route">
                <span>From</span>
                <b className="d">HOME</b>
              </div>
              <div className="vy-route">
                <span>To</span>
                <b className="d">{place.slice(0, 3).toUpperCase()}</b>
              </div>
              <div>
                <span>Date</span>
                <b>{ctx.date || "TBA"}</b>
              </div>
              <div>
                <span>Boarding</span>
                <b>{ceremony?.time || "TBA"}</b>
              </div>
              <div>
                <span>Gate</span>
                <b>{ceremony?.venue || "TBA"}</b>
              </div>
              <div>
                <span>Seat</span>
                <b>Next to us</b>
              </div>
            </div>
          </div>
          <div className="vy-pass-stub">
            <span>{code}</span>
            <b className="d">
              {ctx.p1}
              <br />&amp; {ctx.p2}
            </b>
            <Countdown date={c.date} className="vy-count" labels={["days", "hrs", "min"]} />
          </div>
        </div>
      </section>

      <Sections
        ctx={ctx}
        wrap={(id, i, content) => (
          <section id={id} className={`vy-sec vy-sec--${id}`}>
            <header className="vy-head">
              <span className="vy-leg">Leg {i + 1}</span>
              <h2 className="d">{title(ctx, id)}</h2>
            </header>
            {content}
          </section>
        )}
        custom={{
          details: () => (
            <>
              <div className="vy-dests">
                {events(c).map((e, i) => (
                  <article key={i} className="vy-dest">
                    <p className="vy-dest-k">{i === 0 ? "Arrival" : "Destination"}</p>
                    <h3 className="d">{e.title}</h3>
                    <p className="vy-dest-time">{e.time}</p>
                    <p>{e.venue}</p>
                    <p className="m">{e.address}</p>
                    <DirectionsLink e={e} className="vy-pill">
                      Get directions
                    </DirectionsLink>
                  </article>
                ))}
              </div>
              <div className="vy-center">
                <CalendarLink ctx={ctx} className="vy-pill" />
              </div>
              <MapEmbed ctx={ctx} className="vy-map" />
            </>
          ),
          schedule: () => (
            <ol className="vy-route-list">
              {c.schedule.items.map((it, i) => (
                <li key={i}>
                  <span className="vy-rt-time">{it.time}</span>
                  <div>
                    <b className="d">{it.title}</b>
                    <span className="m">{it.detail}</span>
                  </div>
                </li>
              ))}
            </ol>
          ),
          travel: () => (
            <div className="vy-guide">
              <div className="vy-guide-text">
                <p className="vy-dest-k">Travel guide</p>
                <Prose text={c.travel.body} />
              </div>
              {ctx.sections.includes("details") ? (
                <GalleryImg src={ctx.gallery[1] ?? ctx.hero} w={900} className="vy-guide-photo" />
              ) : (
                <MapEmbed ctx={ctx} className="vy-guide-map" />
              )}
            </div>
          ),
          gallery: () => (
            <div className="vy-cards">
              {ctx.gallery.map((src, i) => (
                <figure key={i} className="vy-card">
                  <GalleryImg src={src} w={700} />
                  <figcaption className="s">{CAPTIONS[i % CAPTIONS.length]}</figcaption>
                </figure>
              ))}
            </div>
          ),
          rsvp: () => (
            <div className="vy-checkin">
              <p className="vy-dest-k">Online check-in</p>
              {c.rsvp.body && <p className="vy-checkin-body">{c.rsvp.body}</p>}
              <RsvpForm
                slug={ctx.slug}
                disabled={ctx.mode !== "live"}
                askMeal={c.rsvp.askMeal}
                mealOptions={c.rsvp.mealOptions}
                maxGuests={c.rsvp.maxGuests}
                submitLabel="Check in"
                yesLabel="I'm on board"
                noLabel="Can't make the trip"
              />
            </div>
          ),
        }}
      />

      <footer className="vy-foot">
        <p className="s">See you in {place}</p>
        <p className="k m">{ctx.date}</p>
      </footer>
    </div>
  );
}
