import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardBack, CardFront } from "@/components/card/InvitationCard";
import { InviteSite } from "@/components/invite/InviteSite";
import { resolveCard } from "@/lib/card";
import { SAMPLE_WISHES, sampleContent } from "@/lib/content";
import { COLLECTIONS, isThemeId, getTheme, TEMPLATE_IDS, TEMPLATES, templateOf, THEMES, type TemplateId } from "@/lib/themes";

export function generateStaticParams() {
  return THEMES.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${getTheme(id).name} theme` };
}

export default async function ThemeDemo({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ design?: string }> }) {
  const { id } = await params;
  const { design } = await searchParams;
  const forced = design && (TEMPLATE_IDS as string[]).includes(design) ? (design as TemplateId) : undefined;
  if (!isThemeId(id)) notFound();
  const theme = getTheme(id);
  const i = THEMES.findIndex((t) => t.id === id);
  const prev = THEMES[(i - 1 + THEMES.length) % THEMES.length];
  const next = THEMES[(i + 1) % THEMES.length];

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-line bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/themes" className="text-sm text-stone hover:text-ink">
              ← All themes
            </Link>
            <div className="hidden min-w-0 sm:block">
              <div className="truncate font-serif text-xl leading-none">{theme.name}</div>
              <div className="text-xs text-stone">
                {COLLECTIONS.find((c) => c.id === theme.collection)?.name} · {TEMPLATES.find((t) => t.id === (forced ?? templateOf(theme)))?.name} design
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/themes/${prev.id}`} className="btn btn-light !px-3" aria-label="Previous theme">
              ‹
            </Link>
            <Link href={`/themes/${next.id}`} className="btn btn-light !px-3" aria-label="Next theme">
              ›
            </Link>
            <Link href={`/dashboard/new?theme=${theme.id}`} className="btn">
              Use this theme
            </Link>
          </div>
        </div>
      </div>
      <InviteSite themeId={theme.id} content={sampleContent()} wishes={SAMPLE_WISHES} mode="demo" template={forced} />
      <MatchingCard themeId={theme.id} />
    </>
  );
}

/** The printed invitation that comes with this theme. */
function MatchingCard({ themeId }: { themeId: string }) {
  const theme = getTheme(themeId);
  const r = resolveCard(theme, sampleContent());
  return (
    <section className="border-t border-line bg-[#efebe4] px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-brand">Included with this theme</p>
          <h2 className="mt-2 font-serif text-4xl">The matching invitation</h2>
          <p className="mx-auto mt-2 max-w-xl text-stone">
            A printable 5×7&quot; card in the same art, colours and type, with a QR code to your site on the back. Change the layout, colour and wording
            in your dashboard.
          </p>
        </div>
        <div className="mx-auto grid max-w-3xl gap-8 sm:grid-cols-2">
          <CardFront r={r} />
          <CardBack r={r} url="https://vow.app/olivia-and-james" />
        </div>
      </div>
    </section>
  );
}
