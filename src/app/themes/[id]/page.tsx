import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InviteSite } from "@/components/invite/InviteSite";
import { SAMPLE_WISHES, sampleContent } from "@/lib/content";
import { COLLECTIONS, isThemeId, getTheme, TEMPLATES, templateOf, THEMES } from "@/lib/themes";

export function generateStaticParams() {
  return THEMES.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${getTheme(id).name} theme` };
}

export default async function ThemeDemo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
                {COLLECTIONS.find((c) => c.id === theme.collection)?.name} · {TEMPLATES.find((t) => t.id === templateOf(theme))?.name} design
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
      <InviteSite themeId={theme.id} content={sampleContent()} wishes={SAMPLE_WISHES} mode="demo" />
    </>
  );
}
