import type { Metadata } from "next";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { requireUser } from "@/lib/auth";
import { isThemeId } from "@/lib/themes";
import { NewSiteForm } from "./NewSiteForm";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "New site" };

export default async function NewSite({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  await requireUser();
  const { theme } = await searchParams;
  const catalog = await getCatalog();
  return (
    <>
      <SiteHeader />
      <NewSiteForm initialTheme={theme && isThemeId(theme) ? theme : undefined} catalog={catalog} />
    </>
  );
}
