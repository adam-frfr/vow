import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AdminButton } from "../ui";
import { Card, Empty, fmt, KIND_LABEL } from "../parts";

export const dynamic = "force-dynamic";

export default async function AdminSpam({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind = "" } = await searchParams;
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();

  let eventQuery = supabase.from("SecurityEvent").select("*").gte("createdAt", since).order("createdAt", { ascending: false }).limit(300);
  if (kind) eventQuery = eventQuery.eq("kind", kind);

  const [eventRes, flaggedRes, recentRes, failedRes] = await Promise.all([
    eventQuery,
    supabase.from("Wish").select("id, name, message, hidden, flagged, createdAt, site:Site(slug)").eq("flagged", true).order("createdAt", { ascending: false }).limit(100),
    supabase.from("Wish").select("id, name, message, hidden, flagged, createdAt, site:Site(slug)").eq("flagged", false).order("createdAt", { ascending: false }).limit(30),
    supabase.from("LoginEvent").select("ipHash").eq("ok", false).gte("createdAt", since),
  ]);

  const events = (eventRes.data ?? []) as Array<{ id: string; ipHash: string; kind: string; siteId: string | null; scope?: string | null; detail: string; createdAt: string }>;
  const flagged = ((flaggedRes.data ?? []) as unknown as Array<{ id: string; name: string; message: string; hidden: boolean; flagged: boolean; createdAt: string; site: { slug: string } | { slug: string }[] }>).map((w) => ({
    ...w,
    site: Array.isArray(w.site) ? (w.site[0] ?? { slug: "" }) : (w.site ?? { slug: "" }),
  }));
  const recentWishes = ((recentRes.data ?? []) as unknown as Array<{ id: string; name: string; message: string; hidden: boolean; flagged: boolean; createdAt: string; site: { slug: string } | { slug: string }[] }>).map((w) => ({
    ...w,
    site: Array.isArray(w.site) ? (w.site[0] ?? { slug: "" }) : (w.site ?? { slug: "" }),
  }));
  
  // Aggregate failed logins by ipHash
  const failedCounts = new Map<string, number>();
  for (const l of failedRes.data ?? []) {
    if (l.ipHash) failedCounts.set(l.ipHash, (failedCounts.get(l.ipHash) ?? 0) + 1);
  }
  const failedLogins = [...failedCounts.entries()]
    .map(([ipHash, count]) => ({ ipHash, _count: { _all: count } }))
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 10);

  // Group abuse signals by source.
  const sources = new Map<string, { n: number; kinds: Set<string>; last: string | Date; sites: Set<string> }>();
  for (const e of events) {
    const s = sources.get(e.ipHash) ?? { n: 0, kinds: new Set(), last: e.createdAt, sites: new Set() };
    s.n++;
    s.kinds.add(e.kind);
    if (e.siteId) s.sites.add(e.siteId);
    sources.set(e.ipHash, s);
  }
  const ranked = [...sources.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 15);
  const kinds = Object.keys(KIND_LABEL);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl">Spam &amp; abuse</h1>
      <p className="max-w-2xl text-sm text-stone">
        Sources are anonymous fingerprints of an IP address (we never store the address itself). Bots filling hidden form fields, people hammering
        the forms, wrong passwords, and guestbook messages the spam filter caught all show up here.
      </p>

      <Card title="Guestbook messages caught as spam">
        {flagged.length === 0 ? (
          <Empty>Nothing caught. The spam filter hides suspicious messages here for you to review.</Empty>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {flagged.map((w) => (
              <li key={w.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <b>{w.name}</b> on <Link href={`/${w.site.slug}`} className="underline">/{w.site.slug}</Link>
                  <span className="block break-words text-stone">{w.message}</span>
                  <span className="text-xs text-stone">{fmt(typeof w.createdAt === "string" ? new Date(w.createdAt) : w.createdAt)}</span>
                </span>
                <span className="flex gap-1.5">
                  <AdminButton url={`/api/admin/wishes/${w.id}`} body={{ hidden: false }}>
                    Not spam: show it
                  </AdminButton>
                  <AdminButton url={`/api/admin/wishes/${w.id}`} method="DELETE" tone="danger">
                    Delete
                  </AdminButton>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          title="Top sources (7 days)"
          action={
            events.length > 0 && (
              <AdminButton url="/api/admin/events" method="DELETE" body={{}} confirm="Clear all abuse events?">
                Clear all
              </AdminButton>
            )
          }
        >
          {ranked.length === 0 ? (
            <Empty>No abuse signals this week.</Empty>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {ranked.map(([ip, s]) => (
                <li key={ip} className="flex items-start justify-between gap-3 py-2">
                  <span>
                    <span className="font-mono text-xs">source {ip.slice(0, 8)}</span>
                    <span className="block text-xs text-stone">{[...s.kinds].map((k) => KIND_LABEL[k] ?? k).join(", ")}</span>
                    <span className="text-xs text-stone">last {fmt(typeof s.last === "string" ? new Date(s.last) : s.last)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">{s.n}</span>
                    <AdminButton url="/api/admin/events" method="DELETE" body={{ ipHash: ip }}>
                      Dismiss
                    </AdminButton>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Failed sign-ins by source (7 days)">
          {failedLogins.length === 0 ? (
            <Empty>No failed sign-ins.</Empty>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {failedLogins.map((f) => (
                <li key={f.ipHash} className="flex justify-between py-2">
                  <span className="font-mono text-xs">source {f.ipHash.slice(0, 8)}</span>
                  <span className="text-xs">{f._count._all} failed</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Event log">
        <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
          <a href="?" className={`rounded-full border px-3 py-1.5 ${!kind ? "border-ink bg-ink text-white" : "border-line"}`}>
            All
          </a>
          {kinds.map((k) => (
            <a key={k} href={`?kind=${k}`} className={`rounded-full border px-3 py-1.5 ${kind === k ? "border-ink bg-ink text-white" : "border-line"}`}>
              {KIND_LABEL[k]}
            </a>
          ))}
        </div>
        {events.length === 0 ? (
          <Empty>No events.</Empty>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {events.slice(0, 100).map((e) => (
              <li key={e.id} className="flex justify-between gap-3 py-2">
                <span className="min-w-0">
                  {KIND_LABEL[e.kind] ?? e.kind}
                  {e.scope && <span className="text-stone"> · {e.scope}</span>}
                  <span className="ml-2 font-mono text-[0.65rem] text-stone">{e.ipHash.slice(0, 8)}</span>
                  {e.detail && <span className="block truncate text-xs text-stone">{e.detail}</span>}
                </span>
                <span className="shrink-0 text-xs text-stone">{fmt(new Date(e.createdAt))}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Latest guestbook messages (all sites)">
        {recentWishes.length === 0 ? (
          <Empty>No messages yet.</Empty>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {recentWishes.map((w) => (
              <li key={w.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <span className="min-w-0 flex-1">
                  <b>{w.name}</b> on <Link href={`/${w.site.slug}`} className="underline">/{w.site.slug}</Link>
                  {w.hidden && <span className="ml-2 rounded-full bg-[#eee] px-2 text-xs">hidden</span>}
                  <span className="block break-words text-stone">{w.message}</span>
                </span>
                <span className="flex gap-1.5">
                  <AdminButton url={`/api/admin/wishes/${w.id}`} body={{ hidden: !w.hidden }}>
                    {w.hidden ? "Show" : "Hide"}
                  </AdminButton>
                  <AdminButton url={`/api/admin/wishes/${w.id}`} method="DELETE" tone="danger" confirm="Delete this message?">
                    Delete
                  </AdminButton>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
