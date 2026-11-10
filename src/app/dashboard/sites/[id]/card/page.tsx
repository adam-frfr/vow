import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseContent, parseCustomization } from "@/lib/content";
import { CardStudio } from "./CardStudio";
import { getCatalog } from "@/lib/catalog";
import { CatalogProvider } from "@/components/CatalogProvider";

export const metadata: Metadata = { title: "Invitation card" };

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const site = await db.site.findFirst({ where: { id, userId: user.id } });
  if (!site) notFound();
  const catalog = await getCatalog();
  return (
    <CatalogProvider catalog={catalog}>
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
