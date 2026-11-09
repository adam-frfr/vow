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

export function Countdown({ date }: { date: string }) {
  const [now, setNow] = useState<ReturnType<typeof diff> | null>(null);
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date);

  useEffect(() => {
    if (!valid) return;
    const target = new Date(`${date}T16:00:00`).getTime();
    setNow(diff(target));
    const t = setInterval(() => setNow(diff(target)), 30_000);
    return () => clearInterval(t);
  }, [date, valid]);

  if (!valid || !now) return null;
  return (
    <div className="inv-countdown inv-rise inv-rise-3" aria-label="Countdown to the wedding">
      <div>
        <b>{now.days}</b>
        <span>Days</span>
      </div>
      <div>
        <b>{now.hours}</b>
        <span>Hours</span>
      </div>
      <div>
        <b>{now.minutes}</b>
        <span>Minutes</span>
      </div>
    </div>
  );
}
