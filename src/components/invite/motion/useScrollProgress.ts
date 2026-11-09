"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll progress (0..1) of an element through the viewport.
 *
 * - pinned: progress runs while a tall wrapper scrolls past a sticky child
 *   (0 when the wrapper's top hits the viewport top, 1 when its bottom does).
 * - unpinned: 0 when the element's top enters near the bottom of the viewport,
 *   1 when its middle reaches `endAt` of the viewport height.
 *
 * Listens to scroll on any scroller (capture), so it also works inside the
 * editor's preview pane, which scrolls independently of the window.
 */
export function useScrollProgress<T extends HTMLElement>({ pinned = false, endAt = 0.4 } = {}) {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      let p: number;
      if (pinned) {
        const span = Math.max(r.height - vh, 1);
        p = -r.top / span;
      } else {
        const start = vh * 0.92;
        const end = vh * endAt - r.height / 2;
        p = (start - r.top) / Math.max(start - end, 1);
      }
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onScroll);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "1200px 0px" });
    io.observe(el);
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pinned, endAt]);

  return { ref, progress, near };
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}
