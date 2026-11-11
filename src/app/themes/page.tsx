import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { ThemeGallery } from "./ThemeGallery";
import { getCatalog } from "@/lib/catalog";
import { visibleCollections, visibleTemplates, visibleThemes } from "@/lib/catalog-shared";

export const metadata: Metadata = { title: "Themes" };

export default async function ThemesPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const catalog = await getCatalog();
  const THEMES = visibleThemes(catalog);
  const TEMPLATES = visibleTemplates(catalog);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-14">
        <div className="text-center">
          <p className="eyebrow">
            {THEMES.length} themes · {TEMPLATES.length} site designs · {visibleCollections(catalog).length} collections
          </p>
          <h1 className="mt-3 font-serif text-5xl sm:text-6xl">Find your look</h1>
          <p className="mx-auto mt-4 max-w-xl text-stone">
            Every theme is built on one of {TEMPLATES.length} completely different site designs, from a newspaper front page to a museum
            exhibition. Swap photos, colours, fonts and every word.
          </p>
        </div>
        <ThemeGallery initial={c} catalog={catalog} />
      </main>
    </>
  );
}
