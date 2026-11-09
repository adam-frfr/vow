/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CardBack, CardFront } from "@/components/card/InvitationCard";
import { ALL_FLORALS, floralThumb } from "@/lib/assets";
import { resolveCard } from "@/lib/card";
import type { Customization, InviteContent } from "@/lib/content";
import { CARD_COLORWAYS, CARD_FINISHES, CARD_STYLES, type CardSettings } from "@/lib/stickers";
import { getTheme, googleFontsHref } from "@/lib/themes";
import { Chip } from "../LibraryPanel";

export function CardStudio({
  siteId,
  slug,
  themeId,
  content,
  initialCustomization,
}: {
  siteId: string;
  slug: string;
  themeId: string;
  content: InviteContent;
  initialCustomization: Customization;
}) {
  const theme = getTheme(themeId);
  const [cz, setCz] = useState(initialCustomization);
  const [origin, setOrigin] = useState("");
  const [saved, setSaved] = useState(true);
  const [artKind, setArtKind] = useState<"frame" | "bouquet">("frame");
  useEffect(() => setOrigin(window.location.origin), []);
  const r = useMemo(() => resolveCard(theme, content, cz), [theme, content, cz]);
  const card = cz.card ?? {};
  const set = (patch: Partial<CardSettings>) => {
    setSaved(false);
    setCz((c) => ({ ...c, card: { ...(c.card ?? {}), ...patch } }));
  };

  // Autosave the card settings (the whole customization, so nothing else is lost).
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customization: cz }),
      }).catch(() => null);
      setSaved(!!res?.ok);
    }, 600);
    return () => clearTimeout(t);
  }, [cz, siteId]);

  const url = origin ? `${origin}/${slug}` : "";
  const arts = ALL_FLORALS.filter((f) => (artKind === "frame" ? f.kind === "wreath" || f.kind === "frame" : f.kind === "bouquet" || f.kind === "corner"));
  const patterns = ALL_FLORALS.filter((f) => f.kind === "pattern");
  const text = (k: keyof CardSettings, label: string, value: string) => (
    <label className="block">
      <span className="label">{label}</span>
      <input className="field" value={(card[k] as string | undefined) ?? value} onChange={(e) => set({ [k]: e.target.value })} />
    </label>
  );

  return (
    <div className="min-h-screen bg-[#efebe4]">
      <link rel="stylesheet" href={googleFontsHref([r.fonts.display, r.fonts.body, r.fonts.script])} precedence="default" />
      <header className="flex items-center justify-between gap-3 border-b border-line bg-white px-5 py-3 print:hidden">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/sites/${siteId}`} className="text-sm text-stone hover:text-ink">
            ← Back to editor
          </Link>
          <h1 className="font-serif text-2xl">Matching invitation</h1>
          <span className="text-xs text-stone">{saved ? "Saved" : "Saving…"}</span>
        </div>
        <button className="btn" onClick={() => window.print()}>
          Print or save as PDF
        </button>
      </header>

      <div className="flex flex-col gap-8 p-5 lg:flex-row print:p-0">
        <aside className="w-full shrink-0 space-y-6 rounded-2xl bg-white p-5 lg:w-[380px] print:hidden">
          <p className="text-sm text-stone">
            A printable 5×7&quot; card that matches your website: same painted art, colours and fonts. The back carries a QR code to your site.
          </p>
          <div>
            <span className="label">Layout</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CARD_STYLES) as (keyof typeof CARD_STYLES)[]).map((k) => (
                <Chip key={k} on={r.style === k} onClick={() => set({ style: k })}>
                  {CARD_STYLES[k]}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <span className="label">Card colour</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CARD_COLORWAYS) as (keyof typeof CARD_COLORWAYS)[]).map((k) => (
                <Chip key={k} on={r.colorway === k} onClick={() => set({ colorway: k })}>
                  {CARD_COLORWAYS[k]}
                </Chip>
              ))}
            </div>
          </div>
          <div>
            <span className="label">Art finish</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(CARD_FINISHES) as (keyof typeof CARD_FINISHES)[]).map((k) => (
                <Chip key={k} on={r.finish === k} onClick={() => set({ finish: k })}>
                  {CARD_FINISHES[k]}
                </Chip>
              ))}
            </div>
            <p className="mt-1 text-xs text-stone">White ink and gold foil turn the painting into fine line art, like letterpress.</p>
          </div>

          {r.style === "liner" ? (
            <div>
              <span className="label">Border pattern</span>
              <div className="grid max-h-56 grid-cols-5 gap-1.5 overflow-y-auto">
                {patterns.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    title={p.name}
                    onClick={() => set({ pattern: p.id })}
                    className={`aspect-square overflow-hidden rounded-md border ${r.pattern?.id === p.id ? "border-ink ring-2 ring-ink" : "border-line"}`}
                  >
                    <img src={floralThumb(p.id)} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : r.style !== "minimal" ? (
            <div>
              <span className="label">Painted art</span>
              <div className="mb-2 flex gap-1.5">
                <Chip on={artKind === "frame"} onClick={() => setArtKind("frame")}>
                  Wreaths &amp; frames
                </Chip>
                <Chip on={artKind === "bouquet"} onClick={() => setArtKind("bouquet")}>
                  Bouquets &amp; corners
                </Chip>
              </div>
              <div className="grid max-h-64 grid-cols-4 gap-1.5 overflow-y-auto">
                {arts.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    title={f.name}
                    onClick={() => set({ art: f.id })}
                    className={`aspect-square rounded-md border bg-[#f6efe4] p-1 ${r.art?.id === f.id ? "border-ink ring-2 ring-ink" : "border-line"}`}
                  >
                    <img src={floralThumb(f.id)} alt={f.name} loading="lazy" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <p className="label !mb-0">Wording</p>
            {text("top", "Opening line", r.lines.top)}
            {text("invite", "Invitation line", r.lines.invite)}
            {text("venue", "Venue", r.lines.venue)}
            {text("place", "Town / address", r.lines.place)}
            {text("extra", "Closing line", r.lines.extra)}
            {text("reply", "Back: reply line", r.lines.reply)}
            <p className="text-xs text-stone">Names and date come from your site&apos;s Content tab.</p>
          </div>
          {cz.card && (
            <button type="button" className="text-sm text-stone underline" onClick={() => setCz((c) => ({ ...c, card: undefined }))}>
              Reset card to theme defaults
            </button>
          )}
        </aside>

        <div className="ic-print grid flex-1 content-start gap-8 sm:grid-cols-2 print:block">
          <div className="mx-auto w-full max-w-[460px] print:max-w-none">
            <p className="mb-2 text-center text-xs uppercase tracking-[0.2em] text-stone print:hidden">Front</p>
            <CardFront r={r} />
          </div>
          <div className="mx-auto w-full max-w-[460px] print:max-w-none">
            <p className="mb-2 text-center text-xs uppercase tracking-[0.2em] text-stone print:hidden">Back</p>
            <CardBack r={r} url={url} />
          </div>
        </div>
      </div>
    </div>
  );
}
