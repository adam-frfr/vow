import "./pop.css";
import { dotDate } from "@/lib/content";
import { CalendarLink, DirectionsLink, GalleryImg, HeroImg, MapEmbed, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { RsvpForm } from "../RsvpForm";
import { events, pad2, type Ctx } from "../ctx";

/** Bold party architecture: giant type, marquee, colour blocks, bento grid. */
export function Pop({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const marquee = `${ctx.p1} ♥ ${ctx.p2} — ${dotDate(c.date) || "save the date"} — ${c.location || "let's party"} — `;
  return (
    <div className="t-pp">
      <header className="pp-hero">
        <div className="pp-top">
          <span>{dotDate(c.date)}</span>
          <span>{c.location}</span>
        </div>
        <h1 className="pp-names d">
          <span className="pp-n1 rise">{ctx.p1}</span>
          <span className="pp-mid rise rise-2">
            <span className="pp-pic">
              <HeroImg ctx={ctx} w={1200} />
            </span>
            <span className="pp-amp s">&amp;</span>
          </span>
          <span className="pp-n2 rise rise-3">{ctx.p2}</span>
        </h1>
        <div className="pp-sticker" aria-hidden>
          <span>You&rsquo;re</span>
          <b>invited!</b>
        </div>
      </header>

      <div className="pp-marquee" aria-hidden>
        <div className="pp-marquee-track">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>{marquee}</span>
          ))}
        </div>
      </div>

      <section className="pp-countdown">
        <p className="pp-label">The countdown is on</p>
        <Countdown date={c.date} className="pp-count" />
      </section>

      <Sections
        ctx={ctx}
        wrap={(id, i, content) => (
          <section id={id} className={`pp-sec pp-sec--${i % 3} pp-sec--${id}`}>
            <div className="pp-sec-head">
              <span className="pp-no d">{pad2(i + 1)}</span>
              <h2 className="d">{title(ctx, id)}</h2>
            </div>
            <div className="pp-sec-body">{content}</div>
          </section>
        )}
        custom={{
          details: () => (
            <>
              <div className="pp-cards">
                {events(c).map((e, i) => (
                  <article key={i} className="pp-card">
                    <p className="pp-card-k">{e.title}</p>
                    <p className="pp-card-time d">{e.time}</p>
                    <p className="pp-card-venue">{e.venue}</p>
                    <p>{e.address}</p>
                    <DirectionsLink e={e} className="pp-chip">
                      Take me there →
                    </DirectionsLink>
                  </article>
                ))}
              </div>
              <div className="pp-center">
                <CalendarLink ctx={ctx} className="pp-chip pp-chip--big">
                  + Add to my calendar
                </CalendarLink>
              </div>
              <MapEmbed ctx={ctx} className="pp-map" />
            </>
          ),
          schedule: () => (
            <ol className="pp-rows">
              {c.schedule.items.map((it, i) => (
                <li key={i}>
                  <span className="pp-row-time d">{it.time}</span>
                  <span className="pp-row-title">{it.title}</span>
                  <span className="pp-row-detail">{it.detail}</span>
                </li>
              ))}
            </ol>
          ),
          gallery: () => (
            <div className="pp-bento">
              {ctx.gallery.map((src, i) => (
                <GalleryImg key={i} src={src} w={900} />
              ))}
            </div>
          ),
          rsvp: () => (
            <div className="pp-rsvp">
              {c.rsvp.body && <p className="pp-rsvp-body">{c.rsvp.body}</p>}
              <RsvpForm
                slug={ctx.slug}
                disabled={ctx.mode !== "live"}
                askMeal={c.rsvp.askMeal}
                mealOptions={c.rsvp.mealOptions}
                maxGuests={c.rsvp.maxGuests}
                submitLabel="Count me in!"
                yesLabel="Wouldn't miss it"
                noLabel="Sadly can't"
              />
            </div>
          ),
        }}
      />

      <footer className="pp-foot">
        <p className="d">See you on the dance floor</p>
      </footer>
    </div>
  );
}
