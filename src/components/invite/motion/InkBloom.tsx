/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { floralUrl, INK, inkFrame, type Floral } from "@/lib/assets";
import { usePrefersReducedMotion, useScrollProgress } from "./useScrollProgress";

/** Ink frames are shared by every InkBloom on the page. */
let inkCache: HTMLImageElement[] | null = null;
const inkListeners = new Set<() => void>();
function loadInk() {
  if (inkCache) return inkCache;
  inkCache = Array.from({ length: INK.frames }, (_, i) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => inkListeners.forEach((fn) => fn());
    img.src = inkFrame(i + 1);
    return img;
  });
  return inkCache;
}

type Origin = "tl" | "tr" | "bl" | "br";

/**
 * A painted floral revealed by real ink-spread footage: the ink's density is
 * used as a mask, so the watercolour blooms onto the page as it scrolls in,
 * then settles into the full painting.
 */
export function InkBloom({
  floral,
  origin = "tr",
  className = "",
  style,
  alt = "",
  auto = false,
  delay = 0,
}: {
  floral: Floral;
  origin?: Origin;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  /** Bloom on its own over ~2.6s (for the hero, where nothing scrolls yet). */
  auto?: boolean;
  delay?: number;
}) {
  const { ref, progress: scrollP, near } = useScrollProgress<HTMLDivElement>({ endAt: 0.55 });
  const reduced = usePrefersReducedMotion();
  const [autoP, setAutoP] = useState(0);
  const progress = auto ? autoP : scrollP;

  useEffect(() => {
    if (!auto || !near || reduced) return;
    let raf = 0;
    let start = 0;
    const DUR = 2600;
    const step = (t: number) => {
      if (!start) start = t + delay;
      const x = Math.min(1, Math.max(0, (t - start) / DUR));
      setAutoP(1 - Math.pow(1 - x, 2.2)); // ease-out, like wet ink slowing
      if (x < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [auto, near, reduced, delay]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const art = useRef<HTMLImageElement | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!near) return;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      art.current = img;
      setTick((t) => t + 1);
    };
    img.src = floralUrl(floral.id);
    if (!reduced) {
      loadInk();
      const on = () => setTick((t) => t + 1);
      inkListeners.add(on);
      return () => {
        inkListeners.delete(on);
      };
    }
  }, [near, reduced, floral.id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = art.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    if (reduced) return;

    const REVEAL = 0.8;
    const p = progress;
    const idx = Math.min(INK.frames - 1, Math.floor((Math.min(p, REVEAL) / REVEAL) * (INK.frames - 1)));
    const ink = inkCache?.[idx];
    if (!ink || !ink.complete || !ink.naturalWidth) {
      ctx.clearRect(0, 0, W, H);
      return;
    }
    // The ink enters from the clip's top-right; mirror it so it grows from `origin`.
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    const flipX = origin === "tl" || origin === "bl";
    const flipY = origin === "bl" || origin === "br";
    ctx.translate(flipX ? W : 0, flipY ? H : 0);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    // Oversize the mask so the ink's reach covers the whole artwork.
    const s = Math.max(W / INK.w, H / INK.h) * 1.7;
    ctx.drawImage(ink, W - INK.w * s, 0, INK.w * s, INK.h * s);
    ctx.restore();
    // Settle: fade in the full painting over the last stretch.
    if (p > REVEAL) {
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = Math.min(1, (p - REVEAL) / (1 - REVEAL));
      ctx.drawImage(img, 0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }, [progress, tick, reduced, origin]);

  return (
    <div ref={ref} className={`ink-bloom ${className}`} style={style}>
      <canvas
        ref={canvasRef}
        width={floral.w}
        height={floral.h}
        role="img"
        aria-label={alt || floral.name}
        style={{ aspectRatio: `${floral.w} / ${floral.h}` }}
      />
      <noscript>
        <img src={floralUrl(floral.id)} alt={alt} />
      </noscript>
    </div>
  );
}
