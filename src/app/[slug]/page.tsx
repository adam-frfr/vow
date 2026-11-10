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
import { helperAvailable } from "@/lib/helper";
import { AskWidget } from "@/components/invite/AskWidget";
import { getCatalog } from "@/lib/catalog";
import type { InviteContent } from "@/lib/content";
import Link from "next/link";
import { getTheme, googleFontsHref, img } from "@/lib/themes";

const load = cache(async (slug: string) =>
  db.site.findUnique({
    where: { slug },
    include: {
      photos: { orderBy: { position: "asc" } },
      wishes: { where: { hidden: false }, orderBy: { createdAt: "desc" }, take: 60 },
      user: { select: { blocked: true } },
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

export default async function PublicInvite({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { slug } = await params;
  const { lang } = await searchParams;
  const site = await load(slug);
  // Sites of suspended accounts go offline.
  if (!site || site.user.blocked) notFound();
  const userId = await getUserId();
  // Unpublished sites are only visible to their owner.
  if (!site.published && userId !== site.userId) notFound();

  const original = parseContent(site.content);
  const cz = parseCustomization(site.customization);
  // Second language (AI-translated by the couple): guests switch with ?lang=.
  const tr = cz.translation;
  const translated = !!tr && lang === tr.lang;
  const content = translated ? withTranslation(original, tr.fields) : original;

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
        hideBranding={site.premium}
        art={(await getCatalog()).art}
      />
      {tr && <LanguageSwitch slug={site.slug} lang={tr.lang} active={translated} />}
      {site.published && (await helperAvailable(site)) && <AskWidget slug={site.slug} names={`${original.partner1} & ${original.partner2}`} />}
    </>
  );
}

type Fields = NonNullable<ReturnType<typeof parseCustomization>["translation"]>["fields"];

/** Swap in translated wording, keeping anything the translation left empty. */
function withTranslation(c: InviteContent, f: Fields): InviteContent {
  const or = (t: string, o: string) => t || o;
  return {
    ...c,
    headline: or(f.headline, c.headline),
    tagline: or(f.tagline, c.tagline),
    story: { body: or(f.story, c.story.body) },
    travel: { body: or(f.travel, c.travel.body) },
    dressCode: { body: or(f.dressCode, c.dressCode.body) },
    registry: { ...c.registry, body: or(f.registry, c.registry.body) },
    rsvp: { ...c.rsvp, body: or(f.rsvp, c.rsvp.body) },
    wishes: { body: or(f.wishes, c.wishes.body) },
    faq: { items: f.faq.length ? f.faq.map((x, i) => ({ q: or(x.q, c.faq.items[i]?.q ?? ""), a: or(x.a, c.faq.items[i]?.a ?? "") })) : c.faq.items },
    titles: { ...c.titles, ...f.titles },
  };
}

function LanguageSwitch({ slug, lang, active }: { slug: string; lang: string; active: boolean }) {
  const pill = "rounded-full px-3 py-1.5 transition";
  return (
    <nav aria-label="Language" className="fixed right-3 top-3 z-[60] flex gap-0.5 rounded-full bg-white/90 p-1 text-xs shadow-lg backdrop-blur">
      <Link href={`/${slug}`} className={`${pill} ${!active ? "bg-[#1c1917] text-white" : "text-[#1c1917]"}`}>
        English
      </Link>
      <Link href={`/${slug}?lang=${encodeURIComponent(lang)}`} className={`${pill} ${active ? "bg-[#1c1917] text-white" : "text-[#1c1917]"}`}>
        {lang}
      </Link>
    </nav>
  );
}
