import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { parseContent, parseCustomization } from "@/lib/content";
import { getTheme, googleFontsHref } from "@/lib/themes";
import { isBuilderTheme } from "@/lib/custom-theme";
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
  
  const { data: site } = await supabase
    .from("Site")
    .select("*, photos:Photo(*), wishes:Wish(*)")
    .eq("id", id)
    .eq("userId", user.id)
    .maybeSingle();

  if (!site) notFound();
  const pay = await payConfig();
  const catalog = await getCatalog();

  const sortedPhotos = ((site.photos as { id: string; url: string; position: number }[]) || [])
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const activeWishes = ((site.wishes as { id: string; name: string; message: string; hidden: boolean; createdAt: string }[]) || [])
    .filter((w) => !w.hidden)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 60);

  const activeTheme = getTheme(site.themeId);

  return (
    <>
      <link rel="stylesheet" href={googleFontsHref([activeTheme.fonts.display, activeTheme.fonts.body, activeTheme.fonts.script])} precedence="default" />
      <CatalogProvider catalog={catalog} siteTheme={isBuilderTheme(site.themeId) ? getTheme(site.themeId) : undefined}>
      <Editor
        site={{ id: site.id, slug: site.slug, themeId: site.themeId, published: site.published, isProtected: !!site.passwordHash, premium: site.premium || justPaid }}
        pay={{ ...pay, justPaid, cancelled: paid === "cancelled" }}
        initialContent={parseContent(site.content)}
        initialCustomization={parseCustomization(site.customization)}
        initialPhotos={sortedPhotos.map((p) => ({ id: p.id, url: p.url }))}
        initialWishes={activeWishes.map((w) => ({ id: w.id, name: w.name, message: w.message, createdAt: new Date(w.createdAt).toISOString() }))}
      />
      </CatalogProvider>
    </>
  );
}
