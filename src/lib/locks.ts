import "server-only";
import { getFloral } from "./assets";
import { getCatalog } from "./catalog";
import { artLocked, designLocked, themeLocked, visibleThemes } from "./catalog-shared";
import { parseCustomization, type Customization } from "./content";

/**
 * Why a site may not switch to this theme/design/art (hidden or Premium-only),
 * or null. Only what is changing is checked, so sites already using something
 * the admin later hid or locked keep working.
 */
export async function catalogProblem(
  site: { premium: boolean; themeId: string; customization: string } | null,
  next: { themeId?: string; customization?: Customization },
): Promise<{ status: 400 | 402; error: string } | null> {
  const cat = await getCatalog();
  const before = site ? parseCustomization(site.customization) : {};
  const premium = !!site?.premium;

  if (next.themeId && next.themeId !== site?.themeId) {
    if (!visibleThemes(cat).some((t) => t.id === next.themeId)) return { status: 400, error: "That theme isn't available." };
    if (!premium && themeLocked(cat, next.themeId)) return { status: 402, error: "That theme is part of Premium. Upgrade this site to use it." };
  }
  const tpl = next.customization?.template;
  if (tpl && tpl !== before.template) {
    if (cat.hiddenDesigns.includes(tpl)) return { status: 400, error: "That design isn't available." };
    if (!premium && designLocked(cat, tpl)) return { status: 402, error: "That design is part of Premium. Upgrade this site to use it." };
  }
  if (!premium && next.customization?.stickers) {
    const had = new Set((before.stickers ?? []).map((s) => s.asset));
    for (const s of next.customization.stickers) {
      if (had.has(s.asset)) continue;
      const art = getFloral(s.asset);
      if (artLocked(cat, art)) return { status: 402, error: `“${art?.name}” is part of Premium. Upgrade this site to use it.` };
    }
  }
  return null;
}
