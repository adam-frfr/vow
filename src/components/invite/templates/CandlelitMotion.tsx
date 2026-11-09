"use client";

import { getCutout } from "@/lib/assets";
import { Countdown } from "../Countdown";
import { ScrollSequence } from "../motion/ScrollSequence";

const fade = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

/** The opening: scrolling lights a real candle, and the names rise in its glow. */
export function CandleHero({
  cutoutId,
  headline,
  p1,
  p2,
  date,
  location,
  isoDate,
}: {
  cutoutId: string;
  headline: string;
  p1: string;
  p2: string;
  date: string;
  location: string;
  isoDate: string;
}) {
  const co = getCutout(cutoutId) ?? getCutout("candle-lights")!;
  return (
    <ScrollSequence
      cutout={co}
      pinned
      className="cd-hero"
      label="A candle being lit"
      overlay={(p) => (
        <>
          <div className="cd-glow" style={{ opacity: 0.25 + fade(p, 0.25, 0.7) * 0.75 }} />
          <p className="cd-hint" style={{ opacity: 1 - fade(p, 0.05, 0.2) }}>
            Scroll to light the candle
          </p>
          <div className="cd-title" style={{ opacity: fade(p, 0.42, 0.72), transform: `translateY(${(1 - fade(p, 0.42, 0.8)) * 30}px)` }}>
            <p className="k">{headline || "You are invited"}</p>
            <h1 className="d">
              {p1} <span className="s">&amp;</span> {p2}
            </h1>
            <p className="cd-when">
              {date}
              {location ? ` · ${location}` : ""}
            </p>
            <div style={{ opacity: fade(p, 0.75, 0.95) }}>
              <Countdown date={isoDate} className="cd-count" />
            </div>
          </div>
        </>
      )}
    />
  );
}

/** Before the RSVP: one match lights another. */
export function MatchInterlude() {
  const co = getCutout("match-strike")!;
  return (
    <ScrollSequence
      cutout={co}
      pinned
      className="cd-match"
      label="One match lighting another"
      overlay={(p) => (
        <div className="cd-match-caption" style={{ opacity: fade(p, 0.35, 0.65) }}>
          <p className="d">One spark is all it takes</p>
          <p className="s">kindly reply below</p>
        </div>
      )}
    />
  );
}

/** The closing shimmer. */
export function GlitterClose({ names }: { names: string }) {
  const co = getCutout("gold-glitter")!;
  return (
    <ScrollSequence
      cutout={co}
      className="cd-glitter"
      endAt={0.2}
      label="Gold glitter"
      overlay={() => (
        <div className="cd-glitter-caption">
          <p className="s">See you by candlelight</p>
          <p className="k">{names}</p>
        </div>
      )}
    />
  );
}
