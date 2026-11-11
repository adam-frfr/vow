/* eslint-disable @next/next/no-img-element */
"use client";

import { getCutout, getFloral } from "@/lib/assets";
import { ScrollSequence } from "@/components/invite/motion/ScrollSequence";

const fade = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

/** Horizontal painted floral garland across the top of the landing page */
export function HeroFlorals() {
  const garland = getFloral("garland-pink-roses");
  if (!garland) return null;
  return (
    <div className="lp-garland-wrap">
      <img
        src={`/florals/${garland.id}.webp`}
        alt=""
        className="lp-garland-img"
      />
    </div>
  );
}

/** "Watch it move": the real candle demo, scrubbed by scrolling. */
export function CandleDemo() {
  const co = getCutout("candle-lights")!;
  return (
    <ScrollSequence
      cutout={co}
      pinned
      className="lp-candle"
      label="A candle lighting as you scroll"
      overlay={(p) => (
        <>
          <div className="lp-candle-glow" style={{ opacity: 0.2 + fade(p, 0.25, 0.7) * 0.8 }} />
          <div className="lp-candle-copy lp-candle-copy--a" style={{ opacity: 1 - fade(p, 0.15, 0.32) }}>
            <p className="lp-k">Scroll-animated themes</p>
            <h2>Keep scrolling.</h2>
            <p>This is real footage, frame by frame, with the background removed.</p>
          </div>
          <div className="lp-candle-copy lp-candle-copy--b" style={{ opacity: fade(p, 0.5, 0.75), transform: `translateY(${(1 - fade(p, 0.5, 0.85)) * 24}px)` }}>
            <p className="lp-k">Candlelit design</p>
            <h2>Your guests light the candle.</h2>
            <p>Flowers open, matches strike, glitter falls: every animated theme moves with the scroll.</p>
          </div>
        </>
      )}
    />
  );
}

/** A dandelion that opens beside the feature list. */
export function BloomAside() {
  const co = getCutout("dandelion")!;
  return <ScrollSequence cutout={co} className="lp-bloom" endAt={0.15} label="A dandelion opening" />;
}
