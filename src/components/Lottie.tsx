"use client";

import { useEffect, useRef } from "react";

/**
 * Plays a Lottie JSON animation. Uses lottie-web's "light" SVG player, which
 * has no expression engine, so an uploaded file cannot run JavaScript.
 * Loads only when on screen, pauses off screen, and stays still for visitors
 * who prefer reduced motion.
 */
export function Lottie({ src, className = "", loop = true }: { src: string; className?: string; loop?: boolean }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let anim: { play(): void; pause(): void; goToAndStop(v: number, f?: boolean): void; destroy(): void } | null = null;
    let cancelled = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = false;

    const start = async () => {
      if (anim || cancelled) return;
      const lottie = (await import("lottie-web/build/player/lottie_light")).default;
      if (cancelled) return;
      anim = lottie.loadAnimation({ container: el, renderer: "svg", loop, autoplay: false, path: src, rendererSettings: { preserveAspectRatio: "xMidYMid meet" } });
      if (still) anim.goToAndStop(0, true);
      else if (visible) anim.play();
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) {
          start();
          if (anim && !still) anim.play();
        } else anim?.pause();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      anim?.destroy();
    };
  }, [src, loop]);

  return <div ref={box} className={`lottie ${className}`} role="img" aria-hidden />;
}
