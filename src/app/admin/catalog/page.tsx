import Link from "next/link";
import { getCatalog, getDraftThemes } from "@/lib/catalog";
import { supabase } from "@/lib/supabase";
import { TEMPLATES, templateOf, THEMES } from "@/lib/themes";
import { CatalogAdmin } from "./CatalogAdmin";

export const dynamic = "force-dynamic";

export default async function AdminCatalog() {
  const cat = await getCatalog();
  const drafts = await getDraftThemes();
  const [{ data: builderRows }, { data: siteRows }] = await Promise.all([
    supabase.from("CustomTheme").select("id, status"),
    supabase.from("Site").select("themeId"),
  ]);
  const status = new Map((builderRows ?? []).map((r: { id: string; status: string }) => [r.id, r.status]));
  const usage = new Map<string, number>();
  for (const s of siteRows ?? []) {
    if (s.themeId) usage.set(s.themeId, (usage.get(s.themeId) ?? 0) + 1);
  }
  const all = [...drafts, ...THEMES];
  const count = new Map<string, number>();
  for (const t of all) count.set(templateOf(t), (count.get(templateOf(t)) ?? 0) + 1);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Themes &amp; designs</h1>
          <p className="mt-1 max-w-2xl text-sm text-stone">
            Make themes, organise collections, hide what you don&apos;t want shown and lock anything as Premium. Hidden things disappear from the gallery, the
            landing page and every picker; sites already using them keep working. Premium locks apply only while payments are on.
          </p>
        </div>
        <Link href="/admin/themes/new" className="btn">
          New theme
        </Link>
      </div>
      <CatalogAdmin
        collections={cat.collections}
        designs={TEMPLATES.map((t) => ({ id: t.id, name: t.name, blurb: t.blurb, themes: count.get(t.id) ?? 0 }))}
        themes={all.map((t) => ({
          id: t.id,
          name: t.name,
          design: TEMPLATES.find((d) => d.id === templateOf(t))?.name ?? "",
          collection: cat.themeCollection[t.id] ?? t.collection,
          bg: t.palette.bg,
          accent: t.palette.accent,
          builder: status.get(t.id) ?? null,
          sites: usage.get(t.id) ?? 0,
        }))}
        hiddenThemes={cat.hiddenThemes}
        hiddenDesigns={cat.hiddenDesigns}
        locked={cat.locked}
        payLive={cat.payLive}
      />
    </div>
  );
}
