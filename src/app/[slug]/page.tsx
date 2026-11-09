import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { InviteSite } from "@/components/invite/InviteSite";
import { getUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, parseContent, parseCustomization } from "@/lib/content";

const load = cache(async (slug: string) =>
  db.site.findUnique({ where: { slug }, include: { photos: { orderBy: { position: "asc" } } } }),
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = await load(slug);
  if (!site) return {};
  const c = parseContent(site.content);
  const title = `${c.partner1} & ${c.partner2}`;
  return {
    title: { absolute: title },
    description: [formatDate(c.date), c.location].filter(Boolean).join(" · ") || "We're getting married!",
    robots: { index: false }, // wedding sites are private by default
  };
}

export default async function PublicInvite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await load(slug);
  if (!site) notFound();
  // Unpublished sites are only visible to their owner.
  if (!site.published && (await getUserId()) !== site.userId) notFound();

  return (
    <>
      {!site.published && (
        <div className="sticky top-0 z-50 bg-ink py-2 text-center text-xs uppercase tracking-[0.2em] text-white">
          Draft. Only you can see this until you publish.
        </div>
      )}
      <InviteSite
        themeId={site.themeId}
        content={parseContent(site.content)}
        customization={parseCustomization(site.customization)}
        photos={site.photos.map((p) => p.url)}
        mode={site.published ? "live" : "preview"}
        slug={site.slug}
      />
    </>
  );
}
