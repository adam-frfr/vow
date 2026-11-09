/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { ThemeCard } from "@/components/ui/ThemeCard";
import { COLLECTIONS, getTheme, googleFontsHref, img, THEMES } from "@/lib/themes";

const FEATURED = ["ivory-gold", "black-tie", "cherry-blossom", "redoute", "santorini", "pampas", "midnight", "blush-peony"];

export default function Home() {
  const featured = FEATURED.map(getTheme);
  return (
    <>
      <link rel="stylesheet" href={googleFontsHref(featured.map((t) => t.fonts.script || t.fonts.display))} precedence="default" />
      <SiteHeader overlay />

      {/* Hero */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden text-center text-white">
        <img
          src={img("https://images.unsplash.com/photo-1519741497674-611481863552", 2400)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="relative max-w-3xl px-6">
          <p className="text-xs uppercase tracking-[0.4em] text-white/80">Wedding websites</p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.05] sm:text-7xl">
            Your love story,
            <br />
            <em className="font-normal">beautifully told.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-white/85 sm:text-lg">
            Choose from {THEMES.length} designer themes, make every word your own, and collect RSVPs in one elegant link.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className="btn bg-white !text-ink hover:!bg-ivory">
              Create your site, free
            </Link>
            <Link href="/themes" className="btn border border-white/60 !bg-transparent hover:!bg-white/10">
              Browse themes
            </Link>
          </div>
        </div>
      </section>

      {/* Featured themes */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="text-center">
          <p className="eyebrow">The collection</p>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">Designed to feel like you</h2>
          <p className="mx-auto mt-4 max-w-xl text-stone">
            From black-tie glamour to sweet and playful, every theme is built around real photography and heirloom artwork.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {featured.map((t) => (
            <ThemeCard key={t.id} theme={t} href={`/themes/${t.id}`} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/themes" className="btn btn-light">
            See all {THEMES.length} themes
          </Link>
        </div>
      </section>

      {/* Collections strip */}
      <section className="border-y border-line bg-cream/60 py-20">
        <div className="mx-auto grid max-w-7xl gap-x-10 gap-y-8 px-5 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((c) => (
            <Link key={c.id} href={`/themes?c=${c.id}`} className="group">
              <div className="font-serif text-2xl group-hover:text-brand">{c.name}</div>
              <p className="mt-1 text-sm text-stone">{c.blurb}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-brand">
                {THEMES.filter((t) => t.collection === c.id).length} themes →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <img
            src={img("https://images.unsplash.com/photo-1764380746366-f4d8cc52e1e3", 1200)}
            alt=""
            className="aspect-[4/5] w-full rounded-[200px_200px_16px_16px] object-cover"
          />
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl">Ready before the coffee cools</h2>
            <ol className="mt-10 space-y-8">
              {[
                ["Pick a theme", "Browse the collection and choose the look that feels like your day."],
                ["Make it yours", "Edit every word, reorder sections, upload your photos and fine-tune colours and fonts with a live preview."],
                ["Share & collect RSVPs", "Publish to your own link. Guests RSVP in seconds; you see every reply, meal choice and note in one place."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-5">
                  <span className="font-serif text-3xl text-brand">0{i + 1}</span>
                  <div>
                    <div className="font-serif text-2xl">{t}</div>
                    <p className="mt-1 text-stone">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/signup" className="btn mt-10">
              Start designing
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line py-10 text-center text-xs text-stone">
        <div className="font-serif text-xl text-ink">Vow</div>
        <p className="mt-2">Photography via Unsplash · Botanical plates by P.-J. Redouté (public domain)</p>
      </footer>
    </>
  );
}
