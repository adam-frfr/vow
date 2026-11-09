"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cutoutFrame, type Cutout } from "@/lib/assets";
import { usePrefersReducedMotion, useScrollProgress } from "./useScrollProgress";

/**
 * Canvas that shows frame `progress * (frames-1)` of a cut-out sequence.
 * Frames stream in (coarse-to-fine) once `load` is true; until a frame arrives
 * the nearest loaded one is shown, so scrubbing never goes blank.
 */
export function SequenceCanvas({
  cutout,
  progress,
  load,
  label,
  className = "seq-canvas",
}: {
  cutout: Cutout;
  progress: number;
  load: boolean;
  label?: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frames = useRef<(HTMLImageElement | null)[]>([]);
  const loaded = useRef<boolean[]>([]);
  const target = useRef(0);
  const drawn = useRef(-1);
  const loadedFor = useRef("");

  const draw = (i: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let k = -1;
    for (let d = 0; d < cutout.frames; d++) {
      if (loaded.current[i - d]) {
        k = i - d;
        break;
      }
      if (loaded.current[i + d]) {
        k = i + d;
        break;
      }
    }
    if (k < 0 || k === drawn.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frames.current[k]!, 0, 0, canvas.width, canvas.height);
    drawn.current = k;
  };

  useEffect(() => {
    if (!load || loadedFor.current === cutout.id) return;
    loadedFor.current = cutout.id;
    const n = cutout.frames;
    frames.current = new Array(n).fill(null);
    loaded.current = new Array(n).fill(false);
    drawn.current = -1;
    const order: number[] = [0, n - 1];
    for (let step = 16; step >= 1; step = Math.floor(step / 2)) {
      for (let i = 0; i < n; i += step) if (!order.includes(i)) order.push(i);
      if (step === 1) break;
    }
    const id = cutout.id;
    (reduced ? [n - 1] : order).forEach((i) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (loadedFor.current !== id) return;
        loaded.current[i] = true;
        frames.current[i] = img;
        drawn.current = -1;
        draw(target.current);
      };
      img.src = cutoutFrame(id, i + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, reduced, cutout.id, cutout.frames]);

  useEffect(() => {
    const i = reduced ? cutout.frames - 1 : Math.round(Math.min(1, Math.max(0, progress)) * (cutout.frames - 1));
    target.current = i;
    draw(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, reduced, cutout.frames]);

  return (
    <canvas
      ref={canvasRef}
      width={cutout.w}
      height={cutout.h}
      role="img"
      aria-label={label ?? cutout.name}
      className={className}
      style={{ aspectRatio: `${cutout.w} / ${cutout.h}` }}
    />
  );
}

/** A cut-out sequence scrubbed by its own position in the page. */
export function ScrollSequence({
  cutout,
  pinned = false,
  className = "",
  style,
  endAt,
  label,
  overlay,
}: {
  cutout: Cutout;
  pinned?: boolean;
  className?: string;
  style?: React.CSSProperties;
  endAt?: number;
  label?: string;
  overlay?: (progress: number) => ReactNode;
}) {
  const { ref, progress, near } = useScrollProgress<HTMLDivElement>({ pinned, endAt });
  const reduced = usePrefersReducedMotion();
  const p = reduced ? 1 : progress;
  const canvas = <SequenceCanvas cutout={cutout} progress={progress} load={near} label={label} />;

  if (pinned) {
    return (
      <div ref={ref} className={`seq seq--pinned ${className}`} style={style}>
        <div className="seq-sticky">
          {canvas}
          {overlay?.(p)}
        </div>
      </div>
    );
  }
  return (
    <div ref={ref} className={`seq ${className}`} style={style}>
      {canvas}
      {overlay?.(p)}
    </div>
  );
}
