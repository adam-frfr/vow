/* eslint-disable @next/next/no-img-element */
"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import "./card.css";
import { floralUrl } from "@/lib/assets";
import { FINISH_FILTER, type ResolvedCard } from "@/lib/card";

function vars(r: ResolvedCard) {
  return {
    "--c-bg": r.colors.bg,
    "--c-fg": r.colors.fg,
    "--c-muted": r.colors.muted,
    "--c-accent": r.colors.accent,
    "--c-back-bg": r.colors.backBg,
    "--c-back-fg": r.colors.backFg,
    "--c-display": `"${r.fonts.display}", Georgia, serif`,
    "--c-body": `"${r.fonts.body}", system-ui, sans-serif`,
    "--c-script": `"${r.fonts.script}", cursive`,
  } as React.CSSProperties;
}

function Art({ r, className }: { r: ResolvedCard; className: string }) {
  if (!r.art) return null;
  return (
    <img
      src={floralUrl(r.art.id)}
      alt=""
      className={className}
      style={{ filter: FINISH_FILTER[r.finish], opacity: r.finish === "painted" ? 1 : 0.92 }}
      draggable={false}
    />
  );
}

/** Front of the matching printed invitation (5×7 portrait). */
export function CardFront({ r }: { r: ResolvedCard }) {
  const L = r.lines;
  return (
    <div className={`ic ic--${r.style}`} style={vars(r)}>
      {r.style === "liner" && r.pattern && <div className="ic-liner" style={{ backgroundImage: `url("${floralUrl(r.pattern.id)}")` }} />}
      {r.style === "wreath" && <Art r={r} className="ic-art ic-art--wreath" />}
      {r.style === "crown" && <Art r={r} className="ic-art ic-art--crown" />}
      {r.style === "corners" && (
        <>
          <Art r={r} className="ic-art ic-art--tr" />
          <Art r={r} className="ic-art ic-art--bl" />
        </>
      )}
      <div className="ic-text">
        <div className="ic-head">{L.top && <p className="ic-top">{L.top}</p>}</div>
        <div className="ic-core">
          <h2 className="ic-names">
            <span>{L.p1}</span>
            <span className="ic-and">and</span>
            <span>{L.p2}</span>
          </h2>
          <p className="ic-date">
            <span>{L.date[0]}</span>
            <i />
            <span>{L.date[1]}</span>
            <i />
            <span>{L.date[2]}</span>
          </p>
        </div>
        <div className="ic-foot">
          {L.invite && <p className="ic-invite">{L.invite}</p>}
          {L.venue && <p className="ic-venue">{L.venue}</p>}
          {L.place && <p className="ic-place">{L.place}</p>}
          {L.extra && <p className="ic-extra">{L.extra}</p>}
        </div>
      </div>
    </div>
  );
}

/** Back of the card: monogram, reply line, website and a QR code. */
export function CardBack({ r, url }: { r: ResolvedCard; url: string }) {
  const [qr, setQr] = useState("");
  useEffect(() => {
    if (!url) return;
    // Resolve CSS colours (color-mix) to concrete ones for the QR generator.
    const probe = document.createElement("span");
    document.body.appendChild(probe);
    const resolve = (c: string) => {
      probe.style.color = c;
      const css = getComputedStyle(probe).color;
      const nums = css.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
      // color-mix() resolves to "color(srgb r g b)" with 0..1 channels.
      const rgb = css.startsWith("color(") ? nums.slice(0, 3).map((v) => v * 255) : nums.slice(0, 3);
      return rgb.map((v) => Math.max(0, Math.min(255, Math.round(v))));
    };
    const lum = ([r2, g, b]: number[]) => 0.2126 * r2 + 0.7152 * g + 0.0722 * b;
    const hex = (v: number[]) => "#" + v.map((x) => x.toString(16).padStart(2, "0")).join("");
    const a = resolve(r.colors.backFg);
    const b = resolve(r.colors.backBg);
    probe.remove();
    // Scanners prefer dark modules on a light ground, so the lighter colour is the tile.
    const [dark, light] = lum(a) < lum(b) ? [hex(a), hex(b)] : [hex(b), hex(a)];
    QRCode.toDataURL(url, { width: 360, margin: 1, errorCorrectionLevel: "M", color: { dark, light } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [url, r.colors.backFg, r.colors.backBg]);
  return (
    <div className="ic ic--back" style={vars(r)}>
      <div className="ic-back-inner">
        <p className="ic-mono">{r.initials}</p>
        <p className="ic-back-k">{r.lines.reply}</p>
        {qr && <img src={qr} alt="" className="ic-qr" />}
        <p className="ic-back-k">Details, travel &amp; RSVP</p>
        <p className="ic-url">{url.replace(/^https?:\/\//, "")}</p>
      </div>
    </div>
  );
}
