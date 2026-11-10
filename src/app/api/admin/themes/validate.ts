import { getFloral } from "@/lib/assets";
import { getCatalog } from "@/lib/catalog";
import type { ThemeInput } from "@/lib/custom-theme";

/** Checks the art and collection a builder theme points at actually exist. */
export async function validateThemeRefs(t: ThemeInput): Promise<string | null> {
  const cat = await getCatalog();
  const art = getFloral(t.heroArt);
  if (!art) return "Pick the theme's main art from the library.";
  if (art.format === "lottie") return "The main art must be an image, not an animation.";
  if (!cat.collections.some((c) => c.id === t.collection)) return "Pick a collection.";
  return null;
}
