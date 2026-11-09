import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseContent, parseCustomization } from "@/lib/content";
import { googleFontsHref, THEMES } from "@/lib/themes";
import { Editor } from "./Editor";

export const metadata: Metadata = { title: "Editor" };

export default async function EditSite({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const site = await db.site.findFirst({
    where: { id, userId: user.id },
    include: {
      photos: { orderBy: { position: "asc" } },
      wishes: { where: { hidden: false }, orderBy: { createdAt: "desc" }, take: 60 },
    },
  });
  if (!site) notFound();

  return (
    <>
      <link rel="stylesheet" href={googleFontsHref(THEMES.map((t) => t.fonts.script || t.fonts.display))} precedence="default" />
      <Editor
        site={{ id: site.id, slug: site.slug, themeId: site.themeId, published: site.published, isProtected: !!site.passwordHash }}
        initialContent={parseContent(site.content)}
        initialCustomization={parseCustomization(site.customization)}
        initialPhotos={site.photos.map((p) => ({ id: p.id, url: p.url }))}
        initialWishes={site.wishes.map((w) => ({ id: w.id, name: w.name, message: w.message, createdAt: w.createdAt.toISOString() }))}
      />
    </>
  );
}
