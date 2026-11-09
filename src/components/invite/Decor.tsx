/* eslint-disable @next/next/no-img-element */
"use client";

import { floralUrl, getCutout, getFloral, type Floral } from "@/lib/assets";
import type { Ctx } from "./ctx";
import { InkBloom } from "./motion/InkBloom";
import { ScrollSequence } from "./motion/ScrollSequence";

/** A painted floral: ink-bloom animated when enabled, plain image otherwise. */
export function FloralArt({
  floral,
  ctx,
  className = "",
  origin,
  auto,
  delay,
  style,
}: {
  floral: Floral;
  ctx: Ctx;
  className?: string;
  origin?: "tl" | "tr" | "bl" | "br";
  auto?: boolean;
  delay?: number;
  style?: React.CSSProperties;
}) {
  if (ctx.decor.ink) {
    return <InkBloom floral={floral} origin={origin} auto={auto} delay={delay} className={className} style={style} />;
  }
  return (
    <div className={`ink-bloom ${className}`} style={style}>
      <img src={floralUrl(floral.id)} alt="" loading="lazy" style={{ aspectRatio: `${floral.w} / ${floral.h}` }} />
    </div>
  );
}

/** Painted corner sprays framing the top of the site. */
export function DecorCorners({ ctx }: { ctx: Ctx }) {
  const fl = getFloral(ctx.decor.corner);
  if (!fl || (ctx.dark && fl.tone === "light")) return null;
  return (
    <div className="dc-corners" aria-hidden>
      <FloralArt floral={fl} ctx={ctx} className="dc-corner dc-corner--tr" origin="tr" auto />
      <FloralArt floral={fl} ctx={ctx} className="dc-corner dc-corner--bl" origin="bl" auto delay={500} />
    </div>
  );
}

/** Wreath/frame/bouquet behind the couple's names (templates place this). */
export function HeroFloral({ ctx, className = "" }: { ctx: Ctx; className?: string }) {
  const fl = getFloral(ctx.decor.heroFloral);
  if (!fl || (ctx.dark && fl.tone === "light")) return null;
  return <FloralArt floral={fl} ctx={ctx} className={`dc-hero ${className}`} origin="tr" auto delay={200} />;
}

export function DecorDivider({ ctx, index }: { ctx: Ctx; index: number }) {
  const fl = getFloral(ctx.decor.divider);
  if (!fl || (ctx.dark && fl.tone === "light")) return null;
  return (
    <div className="dc-divider" aria-hidden>
      <FloralArt floral={fl} ctx={ctx} origin={index % 2 ? "tl" : "tr"} />
    </div>
  );
}

/** A chintz band: real patterned paper with a small card on top. */
export function DecorPattern({ ctx }: { ctx: Ctx }) {
  const fl = getFloral(ctx.decor.pattern);
  if (!fl) return null;
  return (
    <div className="dc-pattern" style={{ backgroundImage: `url("${floralUrl(fl.id)}")` }}>
      <div className="dc-pattern-card">
        <p className="s">
          {ctx.p1} &amp; {ctx.p2}
        </p>
        {ctx.date && <p className="k m">{ctx.date}</p>}
      </div>
    </div>
  );
}

const CUTOUT_LINES: Record<string, [string, string]> = {
  "candle-lights": ["Light a candle with us", "and keep the evening glowing"],
  "match-strike": ["One spark", "is all it took"],
  "gold-glitter": ["Let's celebrate", "under a sky of gold"],
  dandelion: ["Make a wish", "we already found ours"],
  orchid: ["Love, in full bloom", "and growing every day"],
  daffodil: ["A new beginning", "opening like spring"],
};

/** Pinned, scroll-scrubbed footage cut-out with a caption that rises with it. */
export function DecorCutout({ ctx }: { ctx: Ctx }) {
  const co = getCutout(ctx.decor.cutout);
  if (!co || (co.tone === "dark" && !ctx.dark)) return null;
  const [a, b] = CUTOUT_LINES[co.id] ?? ["", ""];
  return (
    <section className={`dc-cutout dc-cutout--${co.mode}`} aria-label={co.name}>
      <ScrollSequence
        cutout={co}
        pinned
        className="dc-cutout-seq"
        overlay={(p) => (
          <div className="dc-cutout-caption" style={{ opacity: Math.min(1, Math.max(0, (p - 0.45) / 0.3)), transform: `translateY(${(1 - Math.min(1, p / 0.75)) * 24}px)` }}>
            <p className="d">{a}</p>
            <p className="s">{b}</p>
          </div>
        )}
      />
    </section>
  );
}
