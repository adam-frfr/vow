"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
  };
}

/** Live countdown. Markup: .blk-countdown > div > b + span (templates style it). */
export function Countdown({ date, className = "", labels = ["Days", "Hours", "Minutes"] }: { date: string; className?: string; labels?: string[] }) {
  const [now, setNow] = useState<ReturnType<typeof diff> | null>(null);
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date);

  useEffect(() => {
    if (!valid) return;
    const target = new Date(`${date}T16:00:00`).getTime();
    setNow(diff(target));
    const t = setInterval(() => setNow(diff(target)), 30_000);
    return () => clearInterval(t);
  }, [date, valid]);

  if (!valid) return null;
  const vals = now ? [now.days, now.hours, now.minutes] : ["–", "–", "–"];
  return (
    <div className={`blk-countdown ${className}`} aria-label="Countdown to the wedding">
      {vals.map((v, i) => (
        <div key={i}>
          <b>{v}</b>
          <span>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
