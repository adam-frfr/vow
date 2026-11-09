/* eslint-disable @next/next/no-img-element */
"use client";

import { CUTOUTS, cutoutFrame, floralsOf, floralUrl, type FloralKind } from "@/lib/assets";
import type { Customization } from "@/lib/content";
import { luminance, resolveDecorStyle, STYLE_LABELS, type Decor, type StyleAxes } from "@/lib/decor";
import { getTheme, TEMPLATES, templateOf, type TemplateId } from "@/lib/themes";

type SetCz = React.Dispatch<React.SetStateAction<Customization>>;

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="font-serif text-xl">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-stone">{hint}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

/** Thumbnail grid for picking a floral asset (or theme default / none). */
function FloralPicker({
  kinds,
  value,
  effective,
  onChange,
  dark,
}: {
  kinds: FloralKind[];
  value: string | undefined;
  effective: string | undefined;
  onChange: (v: string | undefined) => void;
  dark: boolean;
}) {
  const items = floralsOf(kinds);
  const tile = (selected: boolean) =>
    `relative overflow-hidden rounded-lg border bg-[#f6efe4] transition ${selected ? "border-ink ring-2 ring-ink" : "border-line hover:border-stone"}`;
  return (
    <div className="grid grid-cols-4 gap-2">
      <button type="button" onClick={() => onChange(undefined)} className={`${tile(value === undefined)} flex aspect-square items-center justify-center text-center text-[0.6rem] leading-tight`}>
        Theme
        <br />
        default
      </button>
      <button type="button" onClick={() => onChange("none")} className={`${tile(value === "none")} flex aspect-square items-center justify-center text-[0.6rem]`}>
        None
      </button>
      {items.map((fl) => {
        const disabled = dark && fl.tone === "light";
        return (
          <button
            key={fl.id}
            type="button"
            title={disabled ? `${fl.name} (light backgrounds only)` : fl.name}
            disabled={disabled}
            onClick={() => onChange(fl.id)}
            className={`${tile(value === fl.id)} aspect-square p-1 disabled:opacity-30`}
          >
            <img
              src={floralUrl(fl.id)}
              alt={fl.name}
              loading="lazy"
              className={`h-full w-full ${fl.kind === "pattern" ? "object-cover" : "object-contain"}`}
            />
            {value === undefined && effective === fl.id && (
              <span className="absolute bottom-0.5 left-0.5 rounded bg-ink/80 px-1 text-[0.5rem] text-white">default</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Segmented<K extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Record<K, string>;
  value: K | undefined;
  onChange: (v: K) => void;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(options) as K[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            className={`rounded-full border px-3 py-1 text-xs ${value === k ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-stone"}`}
          >
            {options[k]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DecorPanel({ themeId, cz, setCz }: { themeId: string; cz: Customization; setCz: SetCz }) {
  const theme = getTheme(themeId);
  const tplId = (cz.template as TemplateId) || templateOf(theme);
  const effective = resolveDecorStyle(theme, tplId, { decor: cz.decor, style: cz.style });
  const dark = luminance(cz.bg || theme.palette.bg) < 0.12;
  const d = cz.decor ?? {};
  const s = cz.style ?? {};
  const setD = (patch: Partial<Decor>) => setCz((c) => ({ ...c, decor: { ...(c.decor ?? {}), ...patch } }));
  const setS = (patch: Partial<StyleAxes>) => setCz((c) => ({ ...c, style: { ...(c.style ?? {}), ...patch } }));

  return (
    <>
      <Section title="Site design" hint="Keep this theme's colours, photos and fonts, but use a different site architecture.">
        <select
          className="field"
          value={cz.template ?? ""}
          onChange={(e) => setCz((c) => ({ ...c, template: e.target.value || undefined }))}
        >
          <option value="">Theme default ({TEMPLATES.find((t) => t.id === templateOf(theme))?.name})</option>
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-stone">{TEMPLATES.find((t) => t.id === tplId)?.blurb}</p>
      </Section>

      <Section title="Scroll animation" hint="Real footage, background removed, that plays as guests scroll.">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setD({ cutout: "none" })}
            className={`flex aspect-square items-center justify-center rounded-lg border text-xs ${d.cutout === "none" ? "border-ink ring-2 ring-ink" : "border-line"}`}
          >
            None
          </button>
          {CUTOUTS.map((co) => {
            const disabled = co.tone === "dark" && !dark;
            const selected = (d.cutout ?? effective.decor.cutout) === co.id;
            return (
              <button
                key={co.id}
                type="button"
                disabled={disabled}
                title={disabled ? `${co.name}: needs a dark background` : co.blurb}
                onClick={() => setD({ cutout: co.id })}
                className={`overflow-hidden rounded-lg border bg-[#1a1714] text-left disabled:opacity-35 ${selected ? "border-ink ring-2 ring-ink" : "border-line"}`}
              >
                <img src={cutoutFrame(co.id, co.frames)} alt="" loading="lazy" className="aspect-square w-full object-contain p-1" />
                <span className="block truncate bg-white px-1.5 py-1 text-[0.62rem]">{co.name}</span>
              </button>
            );
          })}
        </div>
        <Segmented
          label="Where it plays"
          options={{ intro: "After the opening", story: "Before your story", rsvp: "Before the RSVP" }}
          value={d.cutoutAt ?? effective.decor.cutoutAt ?? "intro"}
          onChange={(v) => setD({ cutoutAt: v })}
        />
        {!dark && <p className="text-xs text-stone">Candle, match and glitter glow best on dark backgrounds. Pick a dark theme or background colour to use them.</p>}
      </Section>

      <Section title="Painted florals" hint="Hand-painted watercolour art. Turn on ink bloom and it paints itself in as guests scroll.">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3">
          <input type="checkbox" className="mt-1" checked={d.ink ?? !!effective.decor.ink} onChange={(e) => setD({ ink: e.target.checked })} />
          <span className="text-sm">
            Ink-bloom animation
            <span className="block text-xs text-stone">Florals spread onto the page like wet watercolour.</span>
          </span>
        </label>
        <p className="label !mb-0">Around your names</p>
        <FloralPicker kinds={["wreath", "frame", "bouquet"]} value={d.heroFloral} effective={effective.decor.heroFloral} onChange={(v) => setD({ heroFloral: v })} dark={dark} />
        <p className="label !mb-0 pt-2">Corner sprays</p>
        <FloralPicker kinds={["corner", "bouquet"]} value={d.corner} effective={effective.decor.corner} onChange={(v) => setD({ corner: v })} dark={dark} />
        <p className="label !mb-0 pt-2">Between sections</p>
        <FloralPicker kinds={["garland", "border"]} value={d.divider} effective={effective.decor.divider} onChange={(v) => setD({ divider: v })} dark={dark} />
        <p className="label !mb-0 pt-2">Chintz pattern band</p>
        <FloralPicker kinds={["pattern"]} value={d.pattern} effective={effective.decor.pattern} onChange={(v) => setD({ pattern: v })} dark={dark} />
      </Section>

      <Section title="Style" hint="Fine-tune how this design looks.">
        <Segmented label="Buttons" options={STYLE_LABELS.buttons} value={s.buttons ?? effective.style.buttons} onChange={(v) => setS({ buttons: v })} />
        <Segmented label="Spacing" options={STYLE_LABELS.density} value={s.density ?? effective.style.density} onChange={(v) => setS({ density: v })} />
        <Segmented label="Headings" options={STYLE_LABELS.headings} value={s.headings ?? effective.style.headings} onChange={(v) => setS({ headings: v })} />
        <Segmented label="Gallery layout" options={STYLE_LABELS.gallery} value={s.gallery ?? effective.style.gallery} onChange={(v) => setS({ gallery: v })} />
        <Segmented label="Photo frames (in the gallery)" options={STYLE_LABELS.photo} value={s.photo ?? effective.style.photo} onChange={(v) => setS({ photo: v })} />
        <Segmented label="Section backgrounds" options={STYLE_LABELS.sections} value={s.sections ?? effective.style.sections} onChange={(v) => setS({ sections: v })} />
        {(cz.decor || cz.style || cz.template) && (
          <button
            type="button"
            className="text-sm text-stone underline"
            onClick={() => setCz((c) => ({ ...c, decor: undefined, style: undefined, template: undefined }))}
          >
            Reset decor &amp; style to theme defaults
          </button>
        )}
      </Section>
    </>
  );
}
