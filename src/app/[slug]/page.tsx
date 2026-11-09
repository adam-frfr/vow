import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { cache } from "react";
import "@/components/invite/invite.css";
import { InviteSite } from "@/components/invite/InviteSite";
import { PasswordGate } from "@/components/invite/PasswordGate";
import { getUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, parseContent, parseCustomization } from "@/lib/content";
import { hasSiteAccess } from "@/lib/site-access";
import { getTheme, googleFontsHref, img } from "@/lib/themes";

const load = cache(async (slug: string) =>
  db.site.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: { position: "asc" } },
      wishes: { where: { hidden: false }, orderBy: { createdAt: "desc" }, take: 60 },
    },
  }),
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = await load(slug);
  if (!site) return {};
  const c = parseContent(site.content);
  const title = `${c.partner1} & ${c.partner2}`;
  return {
    title: { absolute: title },
    // Don't leak the date or place of a password-protected wedding in link previews.
    description: site.passwordHash
      ? "You're invited."
      : [formatDate(c.date), c.location].filter(Boolean).join(" · ") || "We're getting married!",
    robots: { index: false }, // wedding sites are private by default
  };
}

export default async function PublicInvite({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await load(slug);
  if (!site) notFound();
  const userId = await getUserId();
  // Unpublished sites are only visible to their owner.
  if (!site.published && userId !== site.userId) notFound();

  const content = parseContent(site.content);
  const cz = parseCustomization(site.customization);

  if (!(await hasSiteAccess(site, userId))) {
    const theme = getTheme(site.themeId);
    const p = theme.palette;
    const style = {
      "--bg": cz.bg || p.bg,
      "--text": cz.text || p.text,
      "--muted": p.muted,
      "--accent": cz.accent || p.accent,
      "--on-accent": p.onAccent,
      "--font-display": `"${cz.displayFont || theme.fonts.display}"`,
      "--font-body": `"${cz.bodyFont || theme.fonts.body}"`,
      "--font-script": `"${cz.scriptFont || theme.fonts.script || theme.fonts.display}"`,
    } as CSSProperties;
    return (
      <>
        <link rel="stylesheet" href={googleFontsHref([theme.fonts.display, theme.fonts.body])} precedence="default" />
        <PasswordGate slug={site.slug} image={img(cz.coverUrl || theme.hero, 1600)} names={`${content.partner1} & ${content.partner2}`} style={style} />
      </>
    );
  }

  return (
    <>
      {!site.published && (
        <div className="sticky top-0 z-50 bg-ink py-2 text-center text-xs uppercase tracking-[0.2em] text-white">
          Draft. Only you can see this until you publish.
        </div>
      )}
      <InviteSite
        themeId={site.themeId}
        content={content}
        customization={cz}
        photos={site.photos.map((p) => p.url)}
        wishes={site.wishes.map((w) => ({ id: w.id, name: w.name, message: w.message, createdAt: w.createdAt.toISOString() }))}
        mode={site.published ? "live" : "preview"}
        slug={site.slug}
      />
    </>
  );
}
