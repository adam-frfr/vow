/* eslint-disable @next/next/no-img-element */
"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

/** QR code (for printed invitations) and one-tap sharing. */
export function ShareTools({ url, names, published }: { url: string; names: string; published: boolean }) {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, { width: 640, margin: 2, errorCorrectionLevel: "M", color: { dark: "#1c1a17", light: "#ffffff" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [url]);

  const text = `You're invited to ${names}'s wedding! ${url}`;
  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(text)}` },
    { label: "Email", href: `mailto:?subject=${encodeURIComponent(`${names}'s wedding`)}&body=${encodeURIComponent(text)}` },
    { label: "SMS", href: `sms:?&body=${encodeURIComponent(text)}` },
  ];

  return (
    <div className="mb-8">
      <h3 className="font-serif text-xl">Share</h3>
      {!published && <p className="mt-0.5 text-xs text-amber-700">Publish your site first. Until then, guests will see a “not found” page.</p>}
      <div className="mt-3 flex gap-4 rounded-2xl border border-line p-4">
        {qr ? <img src={qr} alt={`QR code for ${url}`} className="h-28 w-28 shrink-0 rounded-lg border border-line" /> : <div className="h-28 w-28 shrink-0 rounded-lg bg-cream" />}
        <div className="flex min-w-0 flex-col justify-between gap-2">
          <p className="text-xs text-stone">Print this on your paper invitations or save-the-dates. Guests scan it to open your site.</p>
          {qr && (
            <a className="btn btn-light !px-3 !py-1.5 !text-[0.65rem]" href={qr} download={`${names.replace(/\W+/g, "-").toLowerCase()}-qr.png`}>
              Download QR
            </a>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="btn !px-4 !py-2"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            } catch {}
          }}
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
        {links.map((l) => (
          <a key={l.label} className="btn btn-light !px-4 !py-2" href={l.href} target="_blank" rel="noopener noreferrer">
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
