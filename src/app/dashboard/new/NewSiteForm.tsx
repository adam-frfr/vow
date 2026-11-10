"use client";

import { applyCatalog, themeLocked, visibleCollections, visibleThemes, type Catalog } from "@/lib/catalog-shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeMatch } from "../sites/[id]/AiAssist";
import { ThemeCard } from "@/components/ui/ThemeCard";
import { getTheme } from "@/lib/themes";

export function NewSiteForm({ initialTheme, catalog }: { initialTheme?: string; catalog: Catalog }) {
  applyCatalog(catalog);
  const THEMES = visibleThemes(catalog);
  const COLLECTIONS = visibleCollections(catalog);
  const router = useRouter();
  const [themeId, setThemeId] = useState(initialTheme ?? "");
  const [step, setStep] = useState<1 | 2>(initialTheme ? 2 : 1);
  const [filter, setFilter] = useState<string>("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, themeId }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (res?.ok) router.push(`/dashboard/sites/${data.id}`);
    else {
      setError(data?.error ?? "Couldn't create the site.");
      setBusy(false);
    }
  }

  if (step === 1) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-14">
        <p className="eyebrow">Step 1 of 2</p>
        <h1 className="mt-2 font-serif text-5xl">Choose your theme</h1>
        <p className="mt-2 text-stone">Don’t overthink it. You can switch themes any time without losing your words.</p>
        <div className="mt-6 max-w-xl">
          <ThemeMatch
            onPick={(id) => {
              setThemeId(id);
              setStep(2);
            }}
          />
        </div>
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {[{ id: "all", name: "All" }, ...COLLECTIONS].map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm ${filter === c.id ? "border-ink bg-ink text-white" : "border-line bg-white"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {THEMES.filter((t) => filter === "all" || t.collection === filter).map((t) => (
            <button
              key={t.id}
              className="text-left"
              onClick={() => {
                setThemeId(t.id);
                setStep(2);
                window.scrollTo({ top: 0 });
              }}
            >
              <ThemeCard theme={t} selected={t.id === themeId} locked={themeLocked(catalog, t.id)} />
            </button>
          ))}
        </div>
      </main>
    );
  }

  const theme = getTheme(themeId);
  return (
    <main className="mx-auto grid max-w-5xl gap-12 px-5 py-14 md:grid-cols-[320px_1fr]">
      <div>
        <ThemeCard theme={theme} />
        <button className="mt-4 text-sm text-stone underline" onClick={() => setStep(1)}>
          Choose a different theme
        </button>
      </div>
      <form onSubmit={create} className="space-y-5">
        <p className="eyebrow">Step 2 of 2</p>
        <h1 className="font-serif text-5xl">The happy couple</h1>
        <p className="text-stone">We’ll fill in the rest with lovely starter text you can edit.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="p1">
              First partner
            </label>
            <input id="p1" name="partner1" required maxLength={60} className="field" placeholder="Olivia" />
          </div>
          <div>
            <label className="label" htmlFor="p2">
              Second partner
            </label>
            <input id="p2" name="partner2" required maxLength={60} className="field" placeholder="James" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="date">
            Wedding date (optional)
          </label>
          <input id="date" name="date" type="date" className="field" />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button className="btn" disabled={busy}>
          {busy ? "Creating…" : "Create my site"}
        </button>
      </form>
    </main>
  );
}
