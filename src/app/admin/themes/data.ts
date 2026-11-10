import "server-only";
import { ALL_FLORALS } from "@/lib/assets";
import { getCatalog } from "@/lib/catalog";
import { BUILDER_FONTS } from "@/lib/custom-theme";
import { TEMPLATES } from "@/lib/themes";

/** Everything the theme builder's pickers need. */
export async function builderOptions() {
  const cat = await getCatalog();
  const art = ALL_FLORALS.filter((a) => a.format !== "lottie" && !["pattern", "texture", "animation"].includes(a.kind)).map((a) => ({ id: a.id, name: a.name, kind: a.kind, custom: !!a.custom }));
  return {
    catalog: cat,
    art,
    fonts: BUILDER_FONTS,
    designs: TEMPLATES.map((t) => ({ id: t.id as string, name: t.name })),
    collections: cat.collections.map((c) => ({ id: c.id, name: c.name })),
  };
}
