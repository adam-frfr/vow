"use client";

import { useMemo, useState } from "react";
import { ThemeCard } from "@/components/ui/ThemeCard";
import { collectionBlurb, templateOf, type TemplateId } from "@/lib/themes";
import { applyCatalog, themeLocked, visibleCollections, visibleTemplates, visibleThemes, type Catalog } from "@/lib/catalog-shared";

export function ThemeGallery({ initial, linkPrefix = "/themes/", catalog }: { initial?: string; linkPrefix?: string; catalog: Catalog }) {
  applyCatalog(catalog);
  const COLLECTIONS = visibleCollections(catalog);
  const THEMES = useMemo(() => visibleThemes(catalog), [catalog]);
  const TEMPLATES = useMemo(() => visibleTemplates(catalog), [catalog]);
  const [active, setActive] = useState<string>(
    COLLECTIONS.some((c) => c.id === initial) ? (initial as string) : "all",
  );
  const [design, setDesign] = useState<TemplateId | "all">("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return THEMES.filter((t) => active === "all" || t.collection === active)
      .filter((t) => design === "all" || templateOf(t) === design)
      .filter((t) => !needle || [t.name, t.description, ...t.tags].join(" ").toLowerCase().includes(needle));
  }, [active, design, q, THEMES]);

  const tabs = [{ id: "all" as const, name: "All themes" }, ...COLLECTIONS];
  const designInfo = TEMPLATES.find((t) => t.id === design);

  return (
    <>
      <div className="sticky top-16 z-10 -mx-5 mt-10 border-b border-line bg-ivory/95 px-5 py-4 backdrop-blur">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                    active === t.id ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-stone"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: gold, beach, Klimt…" className="field max-w-xs !rounded-full" />
          </div>
          <label className="flex items-center gap-2">
            <span className="shrink-0 text-xs uppercase tracking-[0.18em] text-stone">Site design</span>
            <select value={design} onChange={(e) => setDesign(e.target.value as TemplateId | "all")} className="field max-w-xs !rounded-full !py-1.5 text-sm">
              <option value="all">Any design ({TEMPLATES.length})</option>
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {(active !== "all" || designInfo) && (
        <p className="mt-8 text-center text-stone">
          {designInfo ? designInfo.blurb : collectionBlurb(active)}
        </p>
      )}

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {list.map((t) => (
          <ThemeCard key={t.id} theme={t} href={`${linkPrefix}${t.id}`} locked={themeLocked(catalog, t.id)} />
        ))}
      </div>
      {!list.length && <p className="mt-16 text-center text-stone">No themes match those filters.</p>}
    </>
  );
}
