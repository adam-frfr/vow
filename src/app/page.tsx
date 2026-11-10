/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import "@/components/invite/invite.css";
import "./landing.css";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { ThemeCard } from "@/components/ui/ThemeCard";
import { CUTOUTS, FLORALS, floralUrl } from "@/lib/assets";
import { getTheme, googleFontsHref, templateOf } from "@/lib/themes";
import { getCatalog } from "@/lib/catalog";
import { visibleCollections, visibleTemplates, visibleThemes } from "@/lib/catalog-shared";

/** Re-checked every minute so admin changes (hidden themes, designs) show up. */
export const revalidate = 60;
import { BloomAside, CandleDemo, HeroFlorals } from "./LandingMotion";

const FAN = ["atelier-peony", "candlelit-noir", "great-wave"];
/** A dozen designs that show the range; the rest are one click away. */
const SHOWCASE = ["menu", "passport", "fineline", "vinyl", "timeline", "herbarium", "deco", "ticket", "gallery", "washi", "candlelit", "bento"] as const;

const features = (designs: number): [string, string][] => [
  ["Scroll-animated themes", "Real footage that moves as guests scroll: a candle lights, a flower opens, a match strikes."],
  ["Painted florals", "Hand-painted watercolour florals that bloom onto the page like wet ink. Pick your own."],
  [`${designs} site designs`, "A dinner menu, a passport, a vinyl record, a museum, a love letter… switch any time."],
  ["A writing assistant", "Stuck on your story or FAQ? AI drafts it in your voice from your details, never inventing facts. You edit every word."],
  ["A helper for guests", "Guests ask “is there parking?” and get an answer from your own site, any time of night."],
  ["Matching printed invitation", "Every theme comes with a printable 5×7 card in the same art and type, with a QR code to your site."],
  ["Every word is yours", "Story, schedule, wedding party, travel, registry, FAQ: reorder, rename or hide any section."],
  ["RSVPs & meal choices", "Guests reply in seconds; you see headcount, meals and notes, and export to a spreadsheet."],
  ["Guestbook", "Friends leave notes on your site. You can hide any of them."],
  ["Private when you want", "Password-protect your site. Drafts stay hidden until you publish."],
  ["Share it anywhere", "A QR code for printed invitations, add-to-calendar, maps and one-tap sharing."],
];

export default async function Home() {
  const catalog = await getCatalog();
  const THEMES = visibleThemes(catalog);
  const TEMPLATES = visibleTemplates(catalog);
  const FEATURES = features(TEMPLATES.length);
  const fan = FAN.map(getTheme);
  const showcase = SHOWCASE.map((id) => TEMPLATES.find((t) => t.id === id))
    .filter((tpl) => !!tpl)
    .map((tpl) => ({ tpl, theme: THEMES.find((t) => templateOf(t) === tpl.id)! }))
    .filter((x) => x.theme);
  const fonts = [...new Set(THEMES.slice(0, 40).map((t) => t.fonts.script || t.fonts.display))];
  return (
    <>
      <link rel="stylesheet" href={googleFontsHref([...fonts, ...showcase.map((s) => s.theme.fonts.script || s.theme.fonts.display)])} precedence="default" />
      <SiteHeader />

      <section className="lp-hero">
        <HeroFlorals />
        <div className="lp-hero-copy">
          <p className="lp-k">Wedding websites</p>
          <h1>
            A wedding website
            <br />
            <em>that feels like a keepsake.</em>
          </h1>
          <p className="lp-sub">
            {THEMES.length} themes on {TEMPLATES.length} completely different designs, with painted florals that bloom in and real footage that moves as
            your guests scroll.
          </p>
          <div className="lp-cta">
            <Link href="/signup" className="btn">
              Create your site, free
            </Link>
            <Link href="/themes" className="btn btn-light">
              Browse {THEMES.length} themes
            </Link>
          </div>
        </div>
        <div className="lp-fan">
          {fan.map((t, i) => (
            <Link key={t.id} href={`/themes/${t.id}`} className={`lp-fan-card lp-fan-card--${i}`}>
              <ThemeCard theme={t} />
            </Link>
          ))}
        </div>
      </section>

      <section className="lp-stats">
        {[
          [THEMES.length, "themes"],
          [TEMPLATES.length, "site designs"],
          [CUTOUTS.length, "scroll animations"],
          [FLORALS.length, "painted florals"],
        ].map(([n, l]) => (
          <div key={l}>
            <b>{n}</b>
            <span>{l}</span>
          </div>
        ))}
      </section>

      <CandleDemo />

      <section className="lp-designs">
        <div className="lp-head">
          <p className="lp-k">Not colour swaps. Different architectures.</p>
          <h2>{TEMPLATES.length} designs, each built differently</h2>
          <p>Every design has its own layout, navigation and way of telling your story. Pick a theme, then switch designs any time.</p>
        </div>
        <div className="lp-design-grid">
          {showcase.map(({ tpl, theme }) => (
            <Link key={tpl.id} href={`/themes/${theme.id}`} className="lp-design">
              <ThemeCard theme={theme} />
              <div className="lp-design-meta">
                <b>{tpl.name}</b>
                <span>{tpl.blurb}</span>
              </div>
            </Link>
          ))}
        </div>
        <p className="lp-more">
          <Link href="/themes">See all {TEMPLATES.length} designs and {THEMES.length} themes →</Link>
        </p>
      </section>

      <section className="lp-florals">
        <div className="lp-head">
          <p className="lp-k">The florals</p>
          <h2>Painted, not drawn by code</h2>
          <p>A library of hand-painted watercolour florals, wreaths, corners, garlands and chintz. Choose them for any theme.</p>
        </div>
        <div className="lp-floral-strip">
          {FLORALS.filter((f) => f.kind !== "pattern" && f.tone === "any")
            .slice(0, 14)
            .map((f) => (
              <img key={f.id} src={floralUrl(f.id)} alt={f.name} loading="lazy" />
            ))}
        </div>
      </section>

      <section className="lp-features">
        <BloomAside />
        <div>
          <p className="lp-k">Everything a wedding needs</p>
          <h2>Thoughtful, all the way to the RSVP</h2>
          <ul>
            {FEATURES.map(([t, d]) => (
              <li key={t}>
                <b>{t}</b>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lp-collections">
        {visibleCollections(catalog)
          .filter((c) => THEMES.some((t) => t.collection === c.id))
          .map((c) => (
          <Link key={c.id} href={`/themes?c=${c.id}`}>
            <b>{c.name}</b>
            <span>{c.blurb}</span>
            <em>{THEMES.filter((t) => t.collection === c.id).length} themes →</em>
          </Link>
        ))}
      </section>

      <section className="lp-steps">
        <p className="lp-k">How it works</p>
        <h2>Ready before the coffee cools</h2>
        <ol>
          {[
            ["Pick a theme", "Browse the collection and choose the look that feels like your day."],
            ["Make it yours", "Edit every word, add photos, choose florals and animations, with a live preview."],
            ["Share & collect RSVPs", "Publish to your own link and print the QR code on your invitations."],
          ].map(([t, d], i) => (
            <li key={t}>
              <span>0{i + 1}</span>
              <b>{t}</b>
              <p>{d}</p>
            </li>
          ))}
        </ol>
        <Link href="/signup" className="btn">
          Start designing
        </Link>
      </section>

      <footer className="lp-foot">
        <div className="font-serif text-2xl text-ink">Vow</div>
        <p>
          Photography via Unsplash · Footage via Pexels · Painted florals via Pixabay · Masterpieces in the public domain (Hokusai, Klimt, Van Gogh, Monet,
          Mucha, Redouté and more)
        </p>
      </footer>
    </>
  );
}
