"use client";

import { useEffect, useRef } from "react";
import { floralUrl } from "@/lib/assets";
import { AMBIENT_SPRITES, type Effects } from "@/lib/stickers";

/**
 * Opt-in page effects. Everything here is off unless the couple (or the
 * theme) turns it on, and all motion respects prefers-reduced-motion.
 */
export function PageEffects({ effects }: { effects: Effects }) {
  const ref = useRef<HTMLDivElement>(null);
  const reveal = effects.reveal && effects.reveal !== "none" ? effects.reveal : null;

  // Section reveal: arm only once JS runs, so content is never hidden without it.
  useEffect(() => {
    const inv = ref.current?.parentElement;
    if (!inv || !reveal || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    inv.dataset.reveal = reveal;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("rv-in")),
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    const watch = () => inv.querySelectorAll("section[id]:not(.rv-in)").forEach((el) => io.observe(el));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(inv, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      delete inv.dataset.reveal;
      inv.querySelectorAll(".rv-in").forEach((el) => el.classList.remove("rv-in"));
    };
  }, [reveal]);

  const ambient = effects.ambient && effects.ambient !== "none" ? effects.ambient : null;
  return (
    <>
      <div ref={ref} hidden />
      {effects.texture && effects.texture !== "none" && (
        <div
          className="fx-texture"
          aria-hidden
          style={{ backgroundImage: `url("${floralUrl(effects.texture)}")`, opacity: effects.textureStrength ?? 0.35 }}
        />
      )}
      {ambient && <Ambient set={ambient} amount={effects.amount ?? "medium"} />}
    </>
  );
}

type P = { x: number; y: number; s: number; vy: number; vx: number; a: number; va: number; ph: number; img: number };

/** Painted petals / leaves / hearts drifting down over the page (canvas, pauses off-screen). */
function Ambient({ set, amount }: { set: keyof typeof AMBIENT_SPRITES; amount: "light" | "medium" | "heavy" }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    const box = wrap.current;
    if (!c || !box || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const imgs = Array.from({ length: AMBIENT_SPRITES[set] }, (_, i) => {
      const im = new Image();
      im.src = `/fx/${set}-${i + 1}.webp`;
      return im;
    });
    const count = { light: 9, medium: 18, heavy: 32 }[amount];
    let W = 0;
    let H = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => {
      W = box.clientWidth;
      H = box.clientHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const spawn = (anywhere: boolean): P => {
      const s = (W < 600 ? 16 : 22) + Math.random() * (W < 600 ? 14 : 22);
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : -s * 2,
        s,
        vy: 18 + Math.random() * 26,
        vx: -6 + Math.random() * 12,
        a: Math.random() * Math.PI * 2,
        va: (-0.6 + Math.random() * 1.2) * 0.9,
        ph: Math.random() * Math.PI * 2,
        img: Math.floor(Math.random() * imgs.length),
      };
    };
    const ps = Array.from({ length: count }, () => spawn(true));
    let raf = 0;
    let last = 0;
    let visible = true;
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 0);
      last = t;
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        p.y += p.vy * dt;
        p.ph += dt * 1.3;
        p.x += (p.vx + Math.sin(p.ph) * 14) * dt;
        p.a += p.va * dt;
        if (p.y > H + p.s * 2) ps[i] = spawn(false);
        const im = imgs[p.img];
        if (!im.complete || !im.naturalWidth) continue;
        const h = (p.s * im.naturalHeight) / im.naturalWidth;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        // A slow "flip" as it tumbles, like a real petal.
        ctx.scale(0.55 + 0.45 * Math.abs(Math.cos(p.ph * 0.7)), 1);
        ctx.globalAlpha = 0.92;
        ctx.drawImage(im, -p.s / 2, -h / 2, p.s, h);
        ctx.restore();
      }
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    const inv = box.parentElement;
    if (inv) io.observe(inv);
    const ro = new ResizeObserver(size);
    ro.observe(box);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [set, amount]);

  return (
    <div ref={wrap} className="fx-ambient" aria-hidden>
      <canvas ref={canvas} />
    </div>
  );
}
