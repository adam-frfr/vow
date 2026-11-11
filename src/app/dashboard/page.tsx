/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { requireUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { formatDate, parseContent, parseCustomization } from "@/lib/content";
import { getTheme, img } from "@/lib/themes";
import { DeleteSiteButton } from "./DeleteSiteButton";
import { getSetting } from "@/lib/settings";

export const metadata: Metadata = { title: "My sites" };

export default async function Dashboard() {
  const user = await requireUser();
  const { data: rawSites } = await supabase
    .from("Site")
    .select("*, rsvps:Rsvp(attending, guests)")
    .eq("userId", user.id)
    .order("updatedAt", { ascending: false });

  const sites = rawSites ?? [];
  const announcement = await getSetting("site.announcement");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-14">
        {announcement && <div className="mb-8 rounded-2xl bg-[#f3ece0] px-5 py-3 text-sm">{announcement}</div>}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Welcome{user.name ? `, ${user.name}` : ""}</p>
            <h1 className="mt-2 font-serif text-5xl">Your wedding sites</h1>
          </div>
          <div className="flex gap-2">
            {user.isAdmin && (
              <Link href="/admin" className="btn btn-light">
                Admin
              </Link>
            )}
            <form action="/api/auth/logout" method="post">
              <button className="btn btn-light">Log out</button>
            </form>
            <Link href="/dashboard/new" className="btn">
              + New site
            </Link>
          </div>
        </div>

        {sites.length === 0 ? (
          <div className="mt-14 rounded-3xl border border-dashed border-line bg-white p-14 text-center">
            <h2 className="font-serif text-3xl">Let’s make your first invitation</h2>
            <p className="mt-2 text-stone">Pick a theme, add your names and you’ll have a beautiful site in minutes.</p>
            <Link href="/dashboard/new" className="btn mt-8">
              Choose a theme
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {sites.map((s) => {
              const c = parseContent(s.content);
              const t = getTheme(s.themeId);
              const cover = parseCustomization(s.customization).coverUrl;
              const rsvps = (s.rsvps as { attending: boolean; guests: number }[]) || [];
              const yes = rsvps.filter((r) => r.attending).reduce((n, r) => n + r.guests, 0);
              return (
                <div key={s.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                  <div className="relative h-48" style={{ background: t.palette.bg }}>
                    <img
                      src={cover ?? img(t.hero, 900)}
                      alt=""
                      className={`h-full w-full ${t.layout === "botanical" && !cover ? "object-contain p-4 mix-blend-multiply" : "object-cover"}`}
                    />
                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.2em] ${
                        s.published ? "bg-emerald-600 text-white" : "bg-white/90 text-ink"
                      }`}
                    >
                      {s.published ? "Live" : "Draft"}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="font-serif text-3xl">
                      {c.partner1} &amp; {c.partner2}
                    </div>
                    <div className="mt-1 text-sm text-stone">
                      {formatDate(c.date) || "No date yet"} · {t.name} theme
                    </div>
                    <div className="mt-1 text-sm text-stone">/{s.slug}</div>
                    <div className="mt-4 flex gap-6 text-sm">
                      <span>
                        <b className="font-serif text-2xl">{rsvps.length}</b> replies
                      </span>
                      <span>
                        <b className="font-serif text-2xl">{yes}</b> attending
                      </span>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <Link href={`/dashboard/sites/${s.id}`} className="btn">
                        Edit
                      </Link>
                      <Link href={`/dashboard/sites/${s.id}/guests`} className="btn btn-light">
                        Guests
                      </Link>
                      <Link href={`/${s.slug}`} target="_blank" className="btn btn-light">
                        View
                      </Link>
                      <DeleteSiteButton id={s.id} names={`${c.partner1} & ${c.partner2}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
