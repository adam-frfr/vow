/* eslint-disable @next/next/no-img-element */
"use client";

import { floralsOf, floralThumb } from "@/lib/assets";
import type { Customization } from "@/lib/content";
import { AMBIENTS, AMOUNTS, REVEALS, type Effects } from "@/lib/stickers";
import { Chip } from "./LibraryPanel";

type SetCz = React.Dispatch<React.SetStateAction<Customization>>;

function Block({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h3 className="font-serif text-xl">{title}</h3>
      <p className="mt-0.5 text-xs text-stone">{hint}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Switch({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex w-full items-start gap-3 rounded-xl border border-line p-3 text-left hover:border-stone">
      <span className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition ${on ? "bg-ink" : "bg-line"}`}>
        <span className={`h-4 w-4 rounded-full bg-white shadow transition ${on ? "translate-x-4" : ""}`} />
      </span>
      <span>
        <span className="block text-sm">{label}</span>
        {hint && <span className="block text-xs text-stone">{hint}</span>}
      </span>
    </button>
  );
}

/** Every effect is opt-in: on, off, or the theme's own default. */
export function EffectsPanel({
  cz,
  setCz,
  themeEffects,
  ink,
  intro,
  setIntro,
}: {
  cz: Customization;
  setCz: SetCz;
  themeEffects: Effects;
  /** Whether florals currently ink-bloom (theme default or the couple's choice). */
  ink: boolean;
  intro: boolean;
  setIntro: (v: boolean) => void;
}) {
  const fx: Effects = { ...themeEffects, ...(cz.effects ?? {}) };
  const set = (patch: Partial<Effects>) => setCz((c) => ({ ...c, effects: { ...(c.effects ?? {}), ...patch } }));
  const textures = floralsOf("texture");

  return (
    <>
      <Block title="Opening & florals" hint="The moments guests notice first.">
        <Switch on={intro} onChange={setIntro} label="Opening envelope" hint="Guests tap to open your invitation before the site appears." />
        <Switch
          on={ink}
          onChange={(v) => setCz((c) => ({ ...c, decor: { ...(c.decor ?? {}), ink: v } }))}
          label="Ink-bloom florals"
          hint="Painted florals spread onto the page like wet watercolour as guests scroll."
        />
      </Block>

      <Block title="Sections appear" hint="How each part of your page arrives as guests scroll to it.">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(REVEALS) as (keyof typeof REVEALS)[]).map((k) => (
            <Chip key={k} on={(fx.reveal ?? "none") === k} onClick={() => set({ reveal: k })}>
              {REVEALS[k]}
            </Chip>
          ))}
        </div>
      </Block>

      <Block title="Falling art" hint="Real painted petals, leaves or hearts drifting down your page.">
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(AMBIENTS) as (keyof typeof AMBIENTS)[]).map((k) => {
            const on = (fx.ambient ?? "none") === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => set({ ambient: k })}
                className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[0.68rem] ${on ? "border-ink ring-2 ring-ink" : "border-line hover:border-stone"}`}
              >
                <span className="flex h-10 items-center gap-0.5">
                  {k === "none" ? (
                    <span className="text-stone">—</span>
                  ) : (
                    [1, 2, 3].map((i) => <img key={i} src={`/fx/${k}-${i}.webp`} alt="" className="h-7 w-7 object-contain" style={{ rotate: `${(i - 2) * 18}deg` }} />)
                  )}
                </span>
                {AMBIENTS[k]}
              </button>
            );
          })}
        </div>
        {fx.ambient && fx.ambient !== "none" && (
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(AMOUNTS) as (keyof typeof AMOUNTS)[]).map((k) => (
              <Chip key={k} on={(fx.amount ?? "medium") === k} onClick={() => set({ amount: k })}>
                {AMOUNTS[k]}
              </Chip>
            ))}
          </div>
        )}
      </Block>

      <Block title="Paper texture" hint="A real watercolour paper or wash laid softly over your whole page.">
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => set({ texture: "none" })}
            className={`flex aspect-square items-center justify-center rounded-lg border text-[0.65rem] ${!fx.texture || fx.texture === "none" ? "border-ink ring-2 ring-ink" : "border-line"}`}
          >
            None
          </button>
          {textures.map((t) => (
            <button
              key={t.id}
              type="button"
              title={t.name}
              onClick={() => set({ texture: t.id })}
              className={`aspect-square overflow-hidden rounded-lg border ${fx.texture === t.id ? "border-ink ring-2 ring-ink" : "border-line"}`}
            >
              <img src={floralThumb(t.id)} alt={t.name} loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        {fx.texture && fx.texture !== "none" && (
          <label className="block">
            <span className="label">Strength</span>
            <input
              type="range"
              className="w-full accent-ink"
              min={5}
              max={80}
              value={Math.round((fx.textureStrength ?? 0.35) * 100)}
              onChange={(e) => set({ textureStrength: Number(e.target.value) / 100 })}
            />
          </label>
        )}
      </Block>

      <Block title="Little touches" hint="Small details, all optional.">
        <Switch on={!!fx.photoHover} onChange={(v) => set({ photoHover: v })} label="Photos lift on hover" hint="Gallery photos rise gently under the cursor." />
      </Block>

      {cz.effects && (
        <button type="button" className="text-sm text-stone underline" onClick={() => setCz((c) => ({ ...c, effects: undefined }))}>
          Reset effects to theme defaults
        </button>
      )}
      <p className="mt-6 text-xs text-stone">Scroll animations made from real footage (a candle lighting, a flower opening) are in the Decor tab.</p>
    </>
  );
}
