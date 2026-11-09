import "./letter.css";
import { formatDate } from "@/lib/content";
import { CalendarLink, DirectionsLink, GalleryImg, HeroImg, MapEmbed, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { RsvpForm } from "../RsvpForm";
import { events, type Ctx } from "../ctx";

/** A handwritten letter to guests, continued in postscripts. */
export function Letter({ ctx }: { ctx: Ctx }) {
  const { c } = ctx;
  const ceremony = events(c)[0];
  const city = c.location.split(",")[0] || "Home";
  const today = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return (
    <div className="t-lt">
      <header className="lt-hero">
        <figure className="lt-photo rise">
          <HeroImg ctx={ctx} w={1000} />
        </figure>
        <article className="lt-letter rise rise-2">
          <p className="lt-dateline">
            {city}, {today}
          </p>
          <p className="s lt-dear">Dearest friends &amp; family,</p>
          <p>
            We have some news we couldn&rsquo;t wait to share: we&rsquo;re getting married
            {ctx.date ? ` on ${ctx.date}` : ""}
            {ceremony?.venue ? ` at ${ceremony.venue}` : ""}
            {c.location ? ` in ${c.location}` : ""}.
          </p>
          <p>
            {c.headline ? `${c.headline}, we ` : "We "}
            {c.tagline || "invite you to celebrate with us"}, and it simply wouldn&rsquo;t be the same without you there.
          </p>
          <p>Everything you need to know is written below. Please read to the very end; we&rsquo;ve left a little reply card for you.</p>
          <p className="lt-closing">With all our love,</p>
          <p className="s lt-sign">
            {ctx.p1} &amp; {ctx.p2}
          </p>
          <Countdown date={c.date} className="lt-count" labels={["days", "hours", "minutes"]} />
        </article>
      </header>

      <Sections
        ctx={ctx}
        wrap={(id, i, content) => (
          <section id={id} className={`lt-ps lt-ps--${id}`}>
            <p className="s lt-ps-mark">{"P." .repeat(Math.min(i, 3)) + "P.S."}</p>
            <h2 className="d">{title(ctx, id)}</h2>
            <div className="lt-ps-body">{content}</div>
          </section>
        )}
        custom={{
          details: () => (
            <>
              {events(c).map((e, i) => (
                <p key={i} className="lt-line">
                  <b>{e.title}</b>
                  {e.time ? ` begins at ${e.time}` : ""}
                  {e.venue ? `, ${e.venue}` : ""}
                  {e.address ? ` (${e.address})` : ""}.{" "}
                  <DirectionsLink e={e} className="lt-link">
                    directions
                  </DirectionsLink>
                </p>
              ))}
              <p className="lt-line">
                <CalendarLink ctx={ctx} className="lt-link">
                  Pop it in your calendar
                </CalendarLink>
              </p>
              <MapEmbed ctx={ctx} className="lt-map" />
            </>
          ),
          schedule: () => (
            <ul className="lt-list">
              {c.schedule.items.map((it, i) => (
                <li key={i}>
                  <b>{it.time}</b> · {it.title}
                  {it.detail ? <i> ({it.detail})</i> : null}
                </li>
              ))}
            </ul>
          ),
          gallery: () => (
            <div className="lt-snaps">
              {ctx.gallery.map((src, i) => (
                <figure key={i} className="lt-snap">
                  <GalleryImg src={src} w={600} />
                </figure>
              ))}
            </div>
          ),
          rsvp: () => (
            <div className="lt-reply">
              <p className="s lt-reply-title">Write back to us</p>
              <p className="m">
                {c.rsvp.body}
                {c.rsvp.deadline ? ` Please reply by ${formatDate(c.rsvp.deadline, "short")}.` : ""}
              </p>
              <RsvpForm
                slug={ctx.slug}
                disabled={ctx.mode !== "live"}
                askMeal={c.rsvp.askMeal}
                mealOptions={c.rsvp.mealOptions}
                maxGuests={c.rsvp.maxGuests}
                submitLabel="Send our reply"
                yesLabel="We'll be there"
                noLabel="Sending love from afar"
              />
            </div>
          ),
        }}
      />

      <footer className="lt-foot">
        <p className="s">
          xo, {ctx.p1} &amp; {ctx.p2}
        </p>
      </footer>
    </div>
  );
}
