/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { COLLECTIONS, img, TEMPLATES, templateOf, type Theme } from "@/lib/themes";

export function ThemeCard({ theme, href, selected }: { theme: Theme; href?: string; selected?: boolean }) {
  const p = theme.palette;
  const framed = theme.layout === "botanical" || theme.layout === "poster";
  const tpl = TEMPLATES.find((t) => t.id === templateOf(theme));
  const body = (
    <div
      className={`group overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.35)] ${
        selected ? "border-ink ring-2 ring-ink" : "border-line"
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden" style={{ background: p.bg }}>
        <img
          src={img(theme.hero, 700)}
          alt=""
          loading="lazy"
          className={`absolute inset-0 h-full w-full transition duration-700 group-hover:scale-105 ${
            framed ? "object-contain p-7 pb-16" : "object-cover"
          } ${theme.layout === "botanical" ? "mix-blend-multiply" : ""}`}
          style={theme.heroFilter ? { filter: theme.heroFilter } : undefined}
        />
        {!framed && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />}
        {tpl && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-ink backdrop-blur">
            {tpl.name}
          </span>
        )}
        <div className={`absolute inset-x-0 bottom-0 p-5 text-center ${framed ? "" : "text-white"}`} style={framed ? { color: p.text } : undefined}>
          <div
            className="text-[1.65rem] leading-tight"
            style={{
              fontFamily: `"${theme.fonts.script || theme.fonts.display}", serif`,
              textTransform: !theme.fonts.script && theme.displayCase === "upper" ? "uppercase" : undefined,
              letterSpacing: !theme.fonts.script && theme.displayCase === "upper" ? "0.08em" : undefined,
            }}
          >
            Olivia &amp; James
          </div>
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="truncate font-serif text-xl">{theme.name}</div>
          <div className="truncate text-xs text-stone">{COLLECTIONS.find((c) => c.id === theme.collection)?.name}</div>
        </div>
        <div className="mt-1 flex shrink-0 -space-x-1.5">
          {[p.bg, p.accent, p.text].map((c, i) => (
            <span key={i} className="h-4 w-4 rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
