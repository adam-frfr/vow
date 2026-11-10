import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { requireUser } from "@/lib/auth";
import { googleFontsHref, isThemeId, THEMES } from "@/lib/themes";
import { NewSiteForm } from "./NewSiteForm";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "New site" };

export default async function NewSite({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  await requireUser();
  const { theme } = await searchParams;
  const catalog = await getCatalog();
  return (
    <>
      <link rel="stylesheet" href={googleFontsHref(THEMES.map((t) => t.fonts.script || t.fonts.display))} precedence="default" />
      <SiteHeader />
      <NewSiteForm initialTheme={theme && isThemeId(theme) ? theme : undefined} catalog={catalog} />
    </>
  );
}
