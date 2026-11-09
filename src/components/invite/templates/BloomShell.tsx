"use client";

import type { ReactNode } from "react";
import { getCutout } from "@/lib/assets";
import { useScrollProgress } from "../motion/useScrollProgress";
import { SequenceCanvas } from "../motion/ScrollSequence";

const STAGES = ["Seed", "Bud", "Unfurling", "Opening", "In bloom", "Full bloom"];

/**
 * Two-column shell: a real flower (footage cut-out) held in a sticky panel,
 * opening frame by frame as the guest scrolls through the whole page.
 */
export function BloomShell({ cutoutId, children, names }: { cutoutId: string; children: ReactNode; names: string }) {
  const co = getCutout(cutoutId) ?? getCutout("dandelion")!;
  const { ref, progress, near } = useScrollProgress<HTMLDivElement>({ pinned: true });
  const stage = STAGES[Math.min(STAGES.length - 1, Math.floor(progress * STAGES.length))];
  return (
    <div ref={ref} className="bl-shell">
      <aside className="bl-stage" aria-hidden>
        <div className="bl-stage-inner">
          <SequenceCanvas cutout={co} progress={progress} load={near} className="bl-canvas" label={co.name} />
          <div className="bl-meter">
            <span className="bl-meter-fill" style={{ transform: `scaleX(${progress})` }} />
          </div>
          <p className="bl-stage-label">
            <span>{stage}</span>
            <span>{names}</span>
          </p>
        </div>
      </aside>
      <div className="bl-main">{children}</div>
    </div>
  );
}
