/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import "./invite.css";
import { formatDate, sectionTitle, type Customization, type InviteContent, type SectionId } from "@/lib/content";
import { getTheme, googleFontsHref, img, SAMPLE_GALLERY, type Theme } from "@/lib/themes";
import { Countdown } from "./Countdown";
import { RsvpForm } from "./RsvpForm";

export interface InviteSiteProps {
  themeId: string;
  content: InviteContent;
  customization?: Customization;
  photos?: string[];
  /** live = published site, preview = editor, demo = theme showcase */
  mode: "live" | "preview" | "demo";
  slug?: string;
}

export function InviteSite({ themeId, content: c, customization: cz = {}, photos = [], mode, slug }: InviteSiteProps) {
  const theme = getTheme(themeId);
  const fonts = {
    display: cz.displayFont || theme.fonts.display,
    body: cz.bodyFont || theme.fonts.body,
    script: cz.scriptFont || theme.fonts.script || cz.displayFont || theme.fonts.display,
  };
  const p = theme.palette;
  const style = {
    "--bg": cz.bg || p.bg,
    "--surface": cz.bg ? `color-mix(in srgb, ${cz.bg} 92%, ${cz.text || p.text})` : p.surface,
    "--text": cz.text || p.text,
    "--muted": cz.text ? `color-mix(in srgb, ${cz.text} 62%, ${cz.bg || p.bg})` : p.muted,
    "--accent": cz.accent || p.accent,
    "--on-accent": p.onAccent,
    "--font-display": `"${fonts.display}"`,
    "--font-body": `"${fonts.body}"`,
    "--font-script": `"${fonts.script}"`,
    "--hero-h": mode === "live" ? "100svh" : mode === "demo" ? "calc(100svh - 64px)" : "760px",
  } as CSSProperties;

  const gallery = photos.length ? photos : mode === "live" ? [] : SAMPLE_GALLERY;
  const cover = cz.coverUrl || photos[0];
  const visible = c.sectionOrder.filter((id) => !c.hidden.includes(id));

  return (
    <div className="inv" style={style} data-case={theme.displayCase === "upper" ? "upper" : "normal"}>
      <link rel="stylesheet" href={googleFontsHref([fonts.display, fonts.body, fonts.script])} precedence="default" />
      <Hero theme={theme} c={c} cover={cover} gallery={gallery} />
      {visible.map((id) => (
        <Section key={id} id={id} c={c} theme={theme} gallery={gallery} mode={mode} slug={slug} />
      ))}
      <footer className="inv-footer">
        <div className="inv-script">
          {c.partner1 || "Partner"} &amp; {c.partner2 || "Partner"}
        </div>
        <div className="inv-eyebrow" style={{ marginTop: "1rem" }}>
          {formatDate(c.date)}
          {c.location ? ` · ${c.location}` : ""}
        </div>
        <small>Made with Vow</small>
      </footer>
    </div>
  );
}

function Names({ c, script }: { c: InviteContent; script?: boolean }) {
  return (
    <h1 className="inv-names inv-display inv-rise inv-rise-2">
      {c.partner1 || "Partner One"}
      <span className={`amp ${script ? "inv-script" : ""}`}>{script ? "and" : "&"}</span>
      {c.partner2 || "Partner Two"}
    </h1>
  );
}

function Meta({ c }: { c: InviteContent }) {
  const date = formatDate(c.date);
  return (
    <div className="inv-hero-meta inv-rise inv-rise-3">
      {date || "Date to be announced"}
      {c.location && (
        <>
          <span className="dot">·</span>
          {c.location}
        </>
      )}
    </div>
  );
}

function Hero({ theme, c, cover, gallery }: { theme: Theme; c: InviteContent; cover?: string; gallery: string[] }) {
  const heroSrc = cover || theme.hero;
  const filter = !cover && theme.heroFilter ? { filter: theme.heroFilter } : undefined;

  switch (theme.layout) {
    case "fullbleed":
      return (
        <header className="inv-hero inv-hero--fullbleed">
          <img className="bg" src={img(heroSrc, 2000)} alt="" style={filter} />
          <div className="shade" />
          <div className="inner">
            <div className="inv-eyebrow inv-rise">{c.headline || "Save the date"}</div>
            <hr className="inv-rule" style={{ background: "#fff" }} />
            <Names c={c} script={!!theme.fonts.script} />
            <Meta c={c} />
            <Countdown date={c.date} />
          </div>
          <div className="scroll">Scroll</div>
        </header>
      );
    case "split":
      return (
        <header className="inv-hero inv-hero--split">
          <div className="photo">
            <img src={img(heroSrc, 1400)} alt="" style={filter} />
          </div>
          <div className="copy">
            <div className="inv-eyebrow inv-rise">{c.headline}</div>
            <hr className="inv-rule" />
            <Names c={c} script={!!theme.fonts.script} />
            <p className="inv-rise inv-rise-3" style={{ color: "var(--muted)", marginTop: "1.2rem", maxWidth: 360 }}>
              {c.tagline}
            </p>
            <Meta c={c} />
            <Countdown date={c.date} />
          </div>
        </header>
      );
    case "arch":
      return (
        <header className="inv-hero inv-hero--arch">
          <div className="inv-eyebrow inv-rise">{c.headline}</div>
          <div className="frame inv-rise">
            <div className="arch">
              <img src={img(heroSrc, 900)} alt="" style={filter} />
            </div>
          </div>
          <Names c={c} script={!!theme.fonts.script} />
          <p className="inv-rise inv-rise-3" style={{ color: "var(--muted)", marginTop: "1rem" }}>
            {c.tagline}
          </p>
          <Meta c={c} />
          <Countdown date={c.date} />
        </header>
      );
    case "botanical":
      return (
        <header className="inv-hero inv-hero--botanical">
          <img className="plate inv-rise" src={cover ? img(cover, 800) : theme.hero} alt="" />
          <div className="inv-eyebrow inv-rise">{c.headline}</div>
          <hr className="inv-rule" />
          <Names c={c} script />
          <p className="inv-rise inv-rise-3" style={{ color: "var(--muted)", marginTop: "1rem", fontStyle: "italic" }}>
            {c.tagline}
          </p>
          <Meta c={c} />
          <Countdown date={c.date} />
        </header>
      );
    case "polaroid": {
      const shots = [heroSrc, ...(cover ? gallery.slice(1) : (theme.extras ?? gallery))].slice(0, 3);
      return (
        <header className="inv-hero inv-hero--polaroid">
          <div className="stack">
            {shots.map((s, i) => (
              <div className="pol" key={i}>
                <img src={img(s, 600)} alt="" />
              </div>
            ))}
          </div>
          <div className="inv-eyebrow inv-rise">{c.headline}</div>
          <Names c={c} script />
          <Meta c={c} />
          <Countdown date={c.date} />
        </header>
      );
    }
  }
}

function Heading({ c, id, eyebrow }: { c: InviteContent; id: SectionId; eyebrow?: string }) {
  return (
    <>
      {eyebrow && <div className="inv-eyebrow">{eyebrow}</div>}
      <h2 className="inv-h2 inv-display">{sectionTitle(c, id)}</h2>
      <hr className="inv-rule" />
    </>
  );
}

function Section({
  id,
  c,
  theme,
  gallery,
  mode,
  slug,
}: {
  id: SectionId;
  c: InviteContent;
  theme: Theme;
  gallery: string[];
  mode: InviteSiteProps["mode"];
  slug?: string;
}) {
  const sprig = theme.layout === "botanical" && theme.extras?.[0];
  const wrap = (children: React.ReactNode, wide = false) => (
    <section className="inv-section" id={id}>
      <div className={`inv-wrap ${wide ? "inv-wrap--wide" : ""}`}>
        {sprig && id === "story" && <img className="inv-sprig" src={sprig} alt="" />}
        {children}
      </div>
    </section>
  );

  switch (id) {
    case "story":
      if (!c.story.body) return null;
      return wrap(
        <>
          <Heading c={c} id={id} eyebrow="How it began" />
          <p className="inv-prose">{c.story.body}</p>
        </>,
      );
    case "details": {
      const events = [c.details.ceremony, c.details.reception].filter((e) => e.venue || e.title);
      if (!events.length) return null;
      return wrap(
        <>
          <Heading c={c} id={id} eyebrow={formatDate(c.date)} />
          <div className="inv-events">
            {events.map((e, i) => (
              <div className="inv-event" key={i}>
                <h3 className="inv-display">{e.title}</h3>
                {e.time && <div className="time">{e.time}</div>}
                <div className="venue">{e.venue}</div>
                <div className="addr">{e.address}</div>
                {(e.mapUrl || e.address) && (
                  <a
                    className="inv-btn inv-btn--ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={safeUrl(e.mapUrl) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue} ${e.address}`)}`}
                  >
                    Directions
                  </a>
                )}
              </div>
            ))}
          </div>
        </>,
        true,
      );
    }
    case "schedule":
      if (!c.schedule.items.length) return null;
      return wrap(
        <>
          <Heading c={c} id={id} eyebrow="The day" />
          <ul className="inv-timeline">
            {c.schedule.items.map((it, i) => (
              <li key={i}>
                <div className="t">{it.time}</div>
                <div>
                  <div className="ti">{it.title}</div>
                  {it.detail && <div className="d">{it.detail}</div>}
                </div>
              </li>
            ))}
          </ul>
        </>,
      );
    case "gallery":
      if (!gallery.length) return null;
      return wrap(
        <>
          <Heading c={c} id={id} eyebrow="Moments" />
          <div className="inv-gallery">
            {gallery.map((src, i) => (
              <img key={i} src={img(src, 900)} alt="" loading="lazy" />
            ))}
          </div>
        </>,
        true,
      );
    case "travel":
      if (!c.travel.body) return null;
      return wrap(
        <>
          <Heading c={c} id={id} eyebrow="Getting there" />
          <p className="inv-prose">{c.travel.body}</p>
        </>,
      );
    case "dressCode":
      if (!c.dressCode.body) return null;
      return wrap(
        <>
          <Heading c={c} id={id} eyebrow="What to wear" />
          <p className="inv-prose">{c.dressCode.body}</p>
        </>,
      );
    case "registry":
      if (!c.registry.body && !c.registry.links.length) return null;
      return wrap(
        <>
          <Heading c={c} id={id} eyebrow="Gifts" />
          <p className="inv-prose">{c.registry.body}</p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            {c.registry.links
              .filter((l) => safeUrl(l.url))
              .map((l, i) => (
                <a key={i} className="inv-btn" href={safeUrl(l.url)} target="_blank" rel="noopener noreferrer">
                  {l.label || "Registry"}
                </a>
              ))}
          </div>
        </>,
      );
    case "faq":
      if (!c.faq.items.length) return null;
      return wrap(
        <>
          <Heading c={c} id={id} eyebrow="Good to know" />
          <div className="inv-faq">
            {c.faq.items.map((f, i) => (
              <details key={i}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </>,
      );
    case "rsvp":
      return wrap(
        <>
          <Heading c={c} id={id} eyebrow={c.rsvp.deadline ? `Kindly reply by ${formatDate(c.rsvp.deadline, "short")}` : "Will you join us?"} />
          {c.rsvp.body && <p className="inv-prose">{c.rsvp.body}</p>}
          <RsvpForm slug={slug} disabled={mode !== "live"} askMeal={c.rsvp.askMeal} mealOptions={c.rsvp.mealOptions} maxGuests={c.rsvp.maxGuests} />
        </>,
      );
  }
}

/** Only allow http(s) links from user content. */
function safeUrl(u: string) {
  try {
    const url = new URL(u);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}
