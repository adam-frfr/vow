/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";

/**
 * "Open your invitation" splash shown once per visit on the live site.
 * Uses the theme's own image as a soft backdrop.
 */
export function Intro({ image, initials, names, date }: { image: string; initials: string[]; names: string; date: string }) {
  const [phase, setPhase] = useState<"hidden" | "shown" | "leaving">("hidden");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("vow-intro") === "1";
    } catch {}
    if (!seen) setPhase("shown");
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = phase === "shown" ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [phase]);

  if (phase === "hidden") return null;

  function open() {
    try {
      sessionStorage.setItem("vow-intro", "1");
    } catch {}
    setPhase("leaving");
    setTimeout(() => setPhase("hidden"), 1100);
  }

  return (
    <div className={`inv-intro ${phase === "leaving" ? "is-leaving" : ""}`} role="dialog" aria-label="Invitation">
      <img className="inv-intro-bg" src={image} alt="" />
      <div className="inv-intro-veil" />
      <div className="inv-intro-card">
        <div className="inv-intro-mono">
          <span>{initials[0]}</span>
          <i>&amp;</i>
          <span>{initials[1]}</span>
        </div>
        <p className="inv-intro-kicker">You are invited to the wedding of</p>
        <p className="inv-intro-names">{names}</p>
        {date && <p className="inv-intro-date">{date}</p>}
        <button className="inv-intro-btn" onClick={open} autoFocus>
          Open invitation
        </button>
      </div>
    </div>
  );
}
