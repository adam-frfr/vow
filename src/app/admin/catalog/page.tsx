import { getCatalog } from "@/lib/catalog";
import { COLLECTIONS, TEMPLATES, templateOf, THEMES } from "@/lib/themes";
import { CatalogAdmin } from "./CatalogAdmin";

export const dynamic = "force-dynamic";

export default async function AdminCatalog() {
  const cat = await getCatalog();
  const count = new Map<string, number>();
  for (const t of THEMES) count.set(templateOf(t), (count.get(templateOf(t)) ?? 0) + 1);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Themes &amp; designs</h1>
        <p className="mt-1 max-w-2xl text-sm text-stone">
          Hide anything you don&apos;t want couples to see. Hidden themes and designs disappear from the gallery, the landing page and every picker; sites
          already using them keep working.
        </p>
      </div>
      <CatalogAdmin
        designs={TEMPLATES.map((t) => ({ id: t.id, name: t.name, blurb: t.blurb, themes: count.get(t.id) ?? 0 }))}
        themes={THEMES.map((t) => ({
          id: t.id,
          name: t.name,
          design: TEMPLATES.find((d) => d.id === templateOf(t))?.name ?? "",
          collection: COLLECTIONS.find((c) => c.id === t.collection)?.name ?? "",
          bg: t.palette.bg,
          accent: t.palette.accent,
        }))}
        hiddenThemes={cat.hiddenThemes}
        hiddenDesigns={cat.hiddenDesigns}
      />
    </div>
  );
}
