/* eslint-disable @next/next/no-img-element */
"use client";

import { Lottie } from "@/components/Lottie";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { floralUrl, getFloral } from "@/lib/assets";
import type { Sticker } from "@/lib/stickers";
import { InkBloom } from "./motion/InkBloom";

export interface StickerEditing {
  selected: string | null;
  onSelect: (id: string | null) => void;
  onChange: (s: Sticker) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

type Box = { top: number; height: number };

/**
 * Horizontal positions/sizes are measured against the content column, not the
 * raw screen: at most REF px wide (the editor's desktop preview), centred.
 * So art placed beside the names stays beside them on a 2560px monitor too.
 */
const REF = 1280;
export const spanOf = (W: number) => Math.min(W, REF);
type Layout = { width: number; anchors: Record<string, Box> };

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Where each anchor (the opening + every section with an id) sits inside the page. */
export function measure(inv: HTMLElement): Layout {
  const ir = inv.getBoundingClientRect();
  const anchors: Record<string, Box> = {};
  let first: HTMLElement | null = null;
  for (const el of Array.from(inv.children) as HTMLElement[]) {
    if (el.tagName === "LINK" || el.classList.contains("stk-layer") || el.classList.contains("fx-ambient") || el.classList.contains("fx-texture")) continue;
    if (el.classList.contains("dc-corners") || el.classList.contains("inv-intro")) continue;
    if (getComputedStyle(el).position === "fixed" || !el.offsetHeight) continue;
    first = el;
    break;
  }
  const hero = first?.getBoundingClientRect();
  anchors.top = { top: 0, height: Math.max(200, hero ? hero.bottom - ir.top : 800) };
  inv.querySelectorAll<HTMLElement>("section[id], header[id], footer[id]").forEach((el) => {
    if (el.closest(".stk-layer")) return;
    const r = el.getBoundingClientRect();
    if (r.height) anchors[el.id] = { top: r.top - ir.top, height: r.height };
  });
  return { width: ir.width, anchors };
}

/** Which anchor a point (page px) belongs to: the section it is over, else the nearest one above. */
export function anchorAt(layout: Layout, y: number): [string, Box] {
  let best: [string, Box] = ["top", layout.anchors.top];
  let bestTop = -Infinity;
  for (const [id, b] of Object.entries(layout.anchors)) {
    if (id === "top") continue;
    if (y >= b.top && y <= b.top + b.height) return [id, b];
    if (b.top <= y && b.top > bestTop) {
      bestTop = b.top;
      best = [id, b];
    }
  }
  if (y <= layout.anchors.top.top + layout.anchors.top.height) return ["top", layout.anchors.top];
  return best;
}

/**
 * Library art the couple placed themselves. Each sticker travels with a
 * section, so it stays put relative to the content on any screen size.
 * In the editor it can be dragged, resized and rotated directly.
 */
export function StickerLayer({ stickers, editing }: { stickers: Sticker[]; editing?: StickerEditing }) {
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [live, setLive] = useState<{ id: string; patch: Partial<{ cx: number; cy: number; w: number; r: number }> } | null>(null);

  const remeasure = useCallback(() => {
    const inv = ref.current?.parentElement;
    if (!inv) return;
    const next = measure(inv);
    setLayout((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, []);

  useIsoLayoutEffect(() => {
    const inv = ref.current?.parentElement;
    if (!inv) return;
    remeasure();
    let raf = 0;
    const ro = new ResizeObserver(() => schedule());
    const observeSections = () => inv.querySelectorAll("section[id]").forEach((el) => ro.observe(el));
    function schedule() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(remeasure);
    }
    ro.observe(inv);
    observeSections();
    // Sections added, removed or reordered in the editor.
    const mo = new MutationObserver((records) => {
      if (records.some((r) => !(r.target as HTMLElement).closest?.(".stk-layer"))) {
        observeSections();
        schedule();
      }
    });
    mo.observe(inv, { childList: true, subtree: true });
    window.addEventListener("resize", schedule);
    document.fonts?.ready.then(schedule).catch(() => {});
    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, [remeasure]);

  const sel = editing?.selected ?? null;
  useEffect(() => {
    if (!editing || !sel) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      const s = stickers.find((x) => x.id === sel);
      if (!s) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        editing.onDelete(sel);
      } else if (e.key === "Escape") editing.onSelect(null);
      else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 2 : 0.4;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        editing.onChange({ ...s, x: s.x + dx, y: s.y + dy * 2 });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, sel, stickers]);

  if (!layout) return <div ref={ref} className="stk-layer" aria-hidden />;
  const W = layout.width;
  const mobile = W < 600;

  function place(s: Sticker) {
    const a = layout!.anchors[s.anchor] ?? layout!.anchors.top;
    const fl = getFloral(s.asset);
    const span = spanOf(W);
    const w = Math.max(28, (s.w / 100) * span);
    const ratio = fl ? fl.h / fl.w : 1;
    return { cx: W / 2 + ((s.x - 50) / 100) * span, cy: a.top + (s.y / 100) * a.height, w, h: w * ratio };
  }

  function startDrag(e: React.PointerEvent, s: Sticker, kind: "move" | "size" | "turn") {
    if (!editing) return;
    e.preventDefault();
    e.stopPropagation();
    editing.onSelect(s.id);
    const inv = ref.current!.parentElement!;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const p0 = place(s);
    const ir0 = inv.getBoundingClientRect();
    const start = { x: e.clientX - ir0.left, y: e.clientY - ir0.top };
    const d0 = Math.hypot(start.x - p0.cx, start.y - p0.cy) || 1;
    let last: { cx: number; cy: number; w: number; r: number } = { cx: p0.cx, cy: p0.cy, w: p0.w, r: s.r ?? 0 };
    const move = (ev: PointerEvent) => {
      const ir = inv.getBoundingClientRect();
      const pt = { x: ev.clientX - ir.left, y: ev.clientY - ir.top };
      if (kind === "move") last = { ...last, cx: p0.cx + pt.x - start.x, cy: p0.cy + pt.y - start.y };
      else if (kind === "size") last = { ...last, w: Math.max(28, p0.w * (Math.hypot(pt.x - p0.cx, pt.y - p0.cy) / d0)) };
      else {
        let deg = (Math.atan2(pt.y - p0.cy, pt.x - p0.cx) * 180) / Math.PI + 90;
        if (deg > 180) deg -= 360;
        if (Math.abs(deg) < 4) deg = 0;
        last = { ...last, r: Math.round(deg) };
      }
      setLive({ id: s.id, patch: last });
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      setLive(null);
      const lay = measure(inv);
      const [anchor, box] = anchorAt(lay, last.cy);
      const span = spanOf(lay.width);
      editing.onChange({
        ...s,
        anchor,
        x: Math.max(-30, Math.min(130, 50 + ((last.cx - lay.width / 2) / span) * 100)),
        y: Math.max(-200, Math.min(600, ((last.cy - box.top) / box.height) * 100)),
        w: Math.max(3, Math.min(140, (last.w / span) * 100)),
        r: last.r,
      });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  return (
    <div ref={ref} className={`stk-layer ${editing ? "stk-layer--edit" : ""}`} aria-hidden={!editing}>
      {stickers.map((s) => {
        const fl = getFloral(s.asset);
        if (!fl || (mobile && s.hideMobile && !editing)) return null;
        let { cx, cy, w } = place(s);
        let r = s.r ?? 0;
        if (live?.id === s.id) ({ cx = cx, cy = cy, w = w, r = r } = live.patch);
        const h = w * (fl.h / fl.w);
        const selected = editing && sel === s.id;
        const anim = s.anim ?? "none";
        return (
          <div
            key={s.id}
            className={`stk ${selected ? "is-sel" : ""} ${mobile && s.hideMobile ? "stk--hidden-mobile" : ""}`}
            style={{ left: cx - w / 2, top: cy - h / 2, width: w, height: h, transform: `rotate(${r}deg)`, opacity: s.o ?? 1 }}
            onPointerDown={editing ? (e) => startDrag(e, s, "move") : undefined}
          >
            <div className="stk-art" style={{ transform: s.flip ? "scaleX(-1)" : undefined }}>
              {fl.format === "lottie" ? (
                <Lottie src={floralUrl(fl.id)} className="stk-lottie" />
              ) : anim === "ink" ? (
                <InkBloom floral={fl} origin="tl" />
              ) : (
                <Animated key={anim} anim={anim} src={floralUrl(fl.id)} editing={!!editing} />
              )}
            </div>
            {selected && (
              <>
                <span className="stk-h stk-h--size" onPointerDown={(e) => startDrag(e, s, "size")} title="Drag to resize" />
                <span className="stk-h stk-h--turn" onPointerDown={(e) => startDrag(e, s, "turn")} title="Drag to rotate" />
                <div className="stk-tools" onPointerDown={(e) => e.stopPropagation()} style={{ transform: `rotate(${-r}deg)` }}>
                  <button type="button" onClick={() => editing!.onChange({ ...s, flip: !s.flip })}>
                    Flip
                  </button>
                  <button type="button" onClick={() => editing!.onDuplicate(s.id)}>
                    Copy
                  </button>
                  <button type="button" onClick={() => editing!.onDelete(s.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Plain image with a scroll-triggered entrance and optional idle motion. */
function Animated({ anim, src, editing }: { anim: string; src: string; editing: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <img ref={ref} src={src} alt="" draggable={false} className={`stk-img ${inView || editing ? "is-in" : ""}`} data-anim={anim} loading="lazy" />;
}
