import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseContent, parseCustomization } from "@/lib/content";
import { googleFontsHref, THEMES } from "@/lib/themes";
import { Editor } from "./Editor";
import { confirmSession, payConfig } from "@/lib/stripe";
import { getCatalog } from "@/lib/catalog";
import { CatalogProvider } from "@/components/CatalogProvider";

export const metadata: Metadata = { title: "Editor" };

export default async function EditSite({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ paid?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { paid } = await searchParams;
  // Back from Stripe: confirm the payment directly (works even before the webhook is set up).
  const justPaid = paid && paid !== "cancelled" ? await confirmSession(paid, user.id) : false;
  const site = await db.site.findFirst({
    where: { id, userId: user.id },
    include: {
      photos: { orderBy: { position: "asc" } },
      wishes: { where: { hidden: false }, orderBy: { createdAt: "desc" }, take: 60 },
    },
  });
  if (!site) notFound();
  const pay = await payConfig();
  const catalog = await getCatalog();

  return (
    <>
      <link rel="stylesheet" href={googleFontsHref(THEMES.map((t) => t.fonts.script || t.fonts.display))} precedence="default" />
      <CatalogProvider catalog={catalog}>
      <Editor
        site={{ id: site.id, slug: site.slug, themeId: site.themeId, published: site.published, isProtected: !!site.passwordHash, premium: site.premium || justPaid }}
        pay={{ ...pay, justPaid, cancelled: paid === "cancelled" }}
        initialContent={parseContent(site.content)}
        initialCustomization={parseCustomization(site.customization)}
        initialPhotos={site.photos.map((p) => ({ id: p.id, url: p.url }))}
        initialWishes={site.wishes.map((w) => ({ id: w.id, name: w.name, message: w.message, createdAt: w.createdAt.toISOString() }))}
      />
      </CatalogProvider>
    </>
  );
}
