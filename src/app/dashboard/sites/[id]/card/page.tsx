import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { parseContent, parseCustomization } from "@/lib/content";
import { CardStudio } from "./CardStudio";
import { getCatalog } from "@/lib/catalog";
import { CatalogProvider } from "@/components/CatalogProvider";
import { isBuilderTheme } from "@/lib/custom-theme";
import { getTheme } from "@/lib/themes";

export const metadata: Metadata = { title: "Invitation card" };

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { data: site } = await supabase.from("Site").select("*").eq("id", id).eq("userId", user.id).maybeSingle();
  if (!site) notFound();
  const catalog = await getCatalog();
  return (
    <CatalogProvider catalog={catalog} siteTheme={isBuilderTheme(site.themeId) ? getTheme(site.themeId) : undefined}>
    <CardStudio
      siteId={site.id}
      slug={site.slug}
      themeId={site.themeId}
      content={parseContent(site.content)}
      initialCustomization={parseCustomization(site.customization)}
    />
    </CatalogProvider>
  );
}
