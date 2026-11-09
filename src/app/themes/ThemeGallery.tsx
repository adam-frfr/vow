"use client";

import { useMemo, useState } from "react";
import { ThemeCard } from "@/components/ui/ThemeCard";
import { COLLECTIONS, THEMES, type CollectionId } from "@/lib/themes";

export function ThemeGallery({ initial, linkPrefix = "/themes/" }: { initial?: string; linkPrefix?: string }) {
  const [active, setActive] = useState<CollectionId | "all">(
    COLLECTIONS.some((c) => c.id === initial) ? (initial as CollectionId) : "all",
  );
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return THEMES.filter((t) => active === "all" || t.collection === active).filter(
      (t) => !needle || [t.name, t.description, ...t.tags].join(" ").toLowerCase().includes(needle),
    );
  }, [active, q]);

  const tabs = [{ id: "all" as const, name: "All themes" }, ...COLLECTIONS];

  return (
    <>
      <div className="sticky top-16 z-10 -mx-5 mt-10 border-b border-line bg-ivory/95 px-5 py-4 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: gold, beach, pink…"
            className="field max-w-xs !rounded-full"
          />
        </div>
      </div>

      {active !== "all" && (
        <p className="mt-8 text-center text-stone">{COLLECTIONS.find((c) => c.id === active)?.blurb}</p>
      )}

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {list.map((t) => (
          <ThemeCard key={t.id} theme={t} href={`${linkPrefix}${t.id}`} />
        ))}
      </div>
      {!list.length && <p className="mt-16 text-center text-stone">No themes match “{q}”.</p>}
    </>
  );
}
