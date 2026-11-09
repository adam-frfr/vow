import "./gallery.css";
import { formatDate } from "@/lib/content";
import { CalendarLink, DirectionsLink, GalleryImg, HeroImg, MapEmbed, Sections, title } from "../blocks";
import { Countdown } from "../Countdown";
import { RsvpForm } from "../RsvpForm";
import { events, ROMAN, type Ctx } from "../ctx";

const ROOM_KICKER: Partial<Record<string, string>> = {
  story: "Exhibition essay",
  details: "Visitor information",
  schedule: "Programme",
  gallery: "The collection",
  party: "Lenders & patrons",
  rsvp: "Admission",
  wishes: "Visitors' book",
  faq: "Visitor questions",
  travel: "Getting here",
};

/** The wedding as a museum exhibition: framed artwork, wall labels, rooms. */
export function Gallery({ ctx }: { ctx: Ctx }) {
  const { c, theme } = ctx;
  const cr = ctx.heroIsTheme ? theme.credit : undefined;
  const ceremony = events(c)[0];
  return (
    <div className="t-gl">
      <header className="gl-top">
        <p className="gl-house">
          The {ctx.p1} &amp; {ctx.p2} Collection
        </p>
        <nav>
          {ctx.sections.slice(0, 5).map((id) => (
            <a key={id} href={`#${id}`}>
              {title(ctx, id)}
            </a>
          ))}
        </nav>
      </header>

      <section className="gl-hero">
        <div className="gl-wall">
          <figure className="gl-frame rise">
            <div className="gl-mat">
              <HeroImg ctx={ctx} w={1600} />
            </div>
          </figure>
        </div>
        <aside className="gl-label rise rise-2">
          <p className="k">Now on view</p>
          <h1 className="d">
            {ctx.p1} <span className="s">&amp;</span> {ctx.p2}
          </h1>
          <p className="gl-sub">{c.tagline || "A celebration of marriage"}</p>
          <dl className="gl-facts">
            <div>
              <dt>Opening</dt>
              <dd>{ctx.date || "To be announced"}</dd>
            </div>
            {ceremony && (
              <div>
                <dt>Venue</dt>
                <dd>{ceremony.venue}</dd>
              </div>
            )}
            {c.location && (
              <div>
                <dt>City</dt>
                <dd>{c.location}</dd>
              </div>
            )}
            <div>
              <dt>Admission</dt>
              <dd>By invitation</dd>
            </div>
          </dl>
          <Countdown date={c.date} className="gl-count" />
          {cr && (
            <p className="gl-art">
              <b>{cr.artist}</b>
              <br />
              <i>{cr.title}</i>, {cr.year}
              <br />
              <span>Public domain. Reproduced for this exhibition.</span>
            </p>
          )}
        </aside>
      </section>

      <Sections
        ctx={ctx}
        wrap={(id, i, content) => (
          <section id={id} className={`gl-room gl-room--${id}`}>
            <div className="gl-room-label">
              <p className="gl-room-no">Room {ROMAN[i]}</p>
              <h2 className="d">{title(ctx, id)}</h2>
              <p className="gl-room-k">{ROOM_KICKER[id] ?? "Exhibit"}</p>
            </div>
            <div className="gl-room-body">{content}</div>
          </section>
        )}
        custom={{
          details: () => (
            <>
              <div className="gl-info">
                {events(c).map((e, i) => (
                  <dl key={i} className="gl-info-card">
                    <dt className="d">{e.title}</dt>
                    <dd>
                      <span>Time</span>
                      {e.time || "TBA"}
                    </dd>
                    <dd>
                      <span>Gallery</span>
                      {e.venue}
                    </dd>
                    <dd>
                      <span>Address</span>
                      {e.address}
                    </dd>
                    <dd>
                      <DirectionsLink e={e} className="gl-link">
                        Plan your visit
                      </DirectionsLink>
                    </dd>
                  </dl>
                ))}
              </div>
              <CalendarLink ctx={ctx} className="gl-link gl-cal" />
              <MapEmbed ctx={ctx} />
            </>
          ),
          schedule: () => (
            <ol className="gl-prog">
              {c.schedule.items.map((it, i) => (
                <li key={i}>
                  <time className="d">{it.time}</time>
                  <div>
                    <b>{it.title}</b>
                    <span>{it.detail}</span>
                  </div>
                </li>
              ))}
            </ol>
          ),
          gallery: () => (
            <div className="gl-hang">
              {ctx.gallery.map((src, i) => (
                <figure key={i}>
                  <div className="gl-mat gl-mat--sm">
                    <GalleryImg src={src} w={700} />
                  </div>
                  <figcaption>
                    <b>Plate {i + 1}</b> · Photograph, {c.date.slice(0, 4) || "undated"}
                  </figcaption>
                </figure>
              ))}
            </div>
          ),
          rsvp: () => (
            <div className="gl-ticket">
              <div className="gl-ticket-main">
                <p className="k">Admission ticket</p>
                <p className="d gl-ticket-title">
                  {ctx.p1} &amp; {ctx.p2}
                </p>
                <p className="m">{formatDate(c.date) || "Opening soon"}</p>
                {c.rsvp.body && <p className="gl-ticket-body">{c.rsvp.body}</p>}
                <RsvpForm
                  slug={ctx.slug}
                  disabled={ctx.mode !== "live"}
                  askMeal={c.rsvp.askMeal}
                  mealOptions={c.rsvp.mealOptions}
                  maxGuests={c.rsvp.maxGuests}
                  submitLabel="Reserve admission"
                />
              </div>
              <div className="gl-ticket-stub">
                <span>Admit</span>
                <b className="d">{c.rsvp.maxGuests}</b>
                <span>{c.rsvp.deadline ? `Reply by ${formatDate(c.rsvp.deadline, "short")}` : "By invitation"}</span>
              </div>
            </div>
          ),
        }}
      />

      <footer className="gl-foot">
        <p className="d">
          {ctx.p1} &amp; {ctx.p2}
        </p>
        <p className="k m">{ctx.date}</p>
      </footer>
    </div>
  );
}
