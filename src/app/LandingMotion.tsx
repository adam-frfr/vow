"use client";

import { getCutout, getFloral } from "@/lib/assets";
import { InkBloom } from "@/components/invite/motion/InkBloom";
import { ScrollSequence } from "@/components/invite/motion/ScrollSequence";

const fade = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

/** Painted florals that bloom in around the landing headline. */
export function HeroFlorals() {
  const corner = getFloral("corner-pink")!;
  const spray = getFloral("peony-pink")!;
  const leftFl = getFloral("corner-tulips") || corner;
  return (
    <>
      <InkBloom floral={leftFl} origin="tl" auto delay={200} className="lp-fl lp-fl--tl" />
      <InkBloom floral={corner} origin="tr" auto className="lp-fl lp-fl--tr" />
      <InkBloom floral={spray} origin="bl" auto delay={700} className="lp-fl lp-fl--bl" />
    </>
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
