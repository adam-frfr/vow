import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { parseContent } from "@/lib/content";
import { getTheme } from "@/lib/themes";
import { AdminButton } from "../ui";
import { Card, Empty, fmt, Search } from "../parts";

export const dynamic = "force-dynamic";

export default async function AdminSites({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  let query = supabase
    .from("Site")
    .select("*, user:User(email, blocked), rsvps:Rsvp(id), wishes:Wish(id), photos:Photo(id)")
    .order("updatedAt", { ascending: false })
    .limit(200);

  if (q) {
    query = query.ilike("slug", `%${q}%`);
  }

  const { data: rawSites } = await query;
  const sites = (((rawSites ?? []) as Array<Record<string, unknown>>).map((s) => ({
    ...s,
    user: (s.user as { email?: string; blocked?: boolean } | null) ?? { email: "", blocked: false },
    _count: {
      rsvps: Array.isArray(s.rsvps) ? s.rsvps.length : 0,
      wishes: Array.isArray(s.wishes) ? s.wishes.length : 0,
      photos: Array.isArray(s.photos) ? s.photos.length : 0,
    },
  }))) as unknown as Array<{
    id: string;
    slug: string;
    title: string;
    content: string;
    themeId: string;
    published: boolean;
    premium: boolean;
    passcode: string | null;
    passwordHash?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    user: { email: string; blocked: boolean };
    _count: { rsvps: number; wishes: number; photos: number };
  }>;

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Sites</h1>
      <Card title={`${sites.length} ${sites.length === 1 ? "site" : "sites"}`}>
        <Search placeholder="Search link or owner email" q={q} />
        {sites.length === 0 ? (
          <Empty>No sites match.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-stone">
                <tr>
                  <th className="py-2 pr-3 font-normal">Couple</th>
                  <th className="py-2 pr-3 font-normal">Owner</th>
                  <th className="py-2 pr-3 font-normal">Theme</th>
                  <th className="py-2 pr-3 font-normal">Guests</th>
                  <th className="py-2 pr-3 font-normal">Updated</th>
                  <th className="py-2 font-normal" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sites.map((s) => {
                  const c = parseContent(s.content);
                  return (
                    <tr key={s.id}>
                      <td className="py-3 pr-3">
                        <Link href={`/${s.slug}`} target="_blank" className="font-medium underline">
                          {c.partner1} &amp; {c.partner2}
                        </Link>
                        <span className="block text-xs text-stone">/{s.slug}</span>
                        <span className="mt-1 flex gap-1 text-[0.65rem]">
                          <span className={`rounded-full px-2 py-0.5 ${s.published ? "bg-emerald-100 text-emerald-900" : "bg-[#eee] text-stone"}`}>
                            {s.published ? "Live" : "Draft"}
                          </span>
                          {s.premium && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">Premium</span>}
                          {s.passwordHash && <span className="rounded-full bg-[#eee] px-2 py-0.5">Password</span>}
                          {s.user.blocked && <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800">Owner suspended</span>}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-xs">{s.user.email}</td>
                      <td className="py-3 pr-3 text-xs">{getTheme(s.themeId).name}</td>
                      <td className="py-3 pr-3 text-xs">
                        {s._count.rsvps} RSVPs · {s._count.wishes} notes · {s._count.photos} photos
                      </td>
                      <td className="py-3 pr-3 text-xs">{fmt(typeof s.updatedAt === "string" ? new Date(s.updatedAt) : s.updatedAt)}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {s.published && (
                            <AdminButton url={`/api/admin/sites/${s.id}`} body={{ published: false }} confirm="Take this site offline? The couple can publish it again.">
                              Unpublish
                            </AdminButton>
                          )}
                          <AdminButton url={`/api/admin/sites/${s.id}`} body={{ premium: !s.premium }}>
                            {s.premium ? "Remove premium" : "Grant premium"}
                          </AdminButton>
                          <AdminButton
                            url={`/api/admin/sites/${s.id}`}
                            method="DELETE"
                            tone="danger"
                            confirm={`Permanently delete /${s.slug} with all its RSVPs and photos? This cannot be undone.`}
                          >
                            Delete
                          </AdminButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
