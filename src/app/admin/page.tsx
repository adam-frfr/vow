import Link from "next/link";
import { db } from "@/lib/db";
import { getBool, getSetting } from "@/lib/settings";
import { Card, Empty, fmt, KIND_LABEL, money, Stat } from "./parts";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;

export default async function AdminHome() {
  const now = Date.now();
  const d1 = new Date(now - DAY);
  const d7 = new Date(now - 7 * DAY);
  const d14 = new Date(now - 14 * DAY);

  const [users, newUsers, sites, published, premium, rsvps, wishes, flagged, active24, active7, ai24, logins14, events24, paid] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: d7 } } }),
    db.site.count(),
    db.site.count({ where: { published: true } }),
    db.site.count({ where: { premium: true } }),
    db.rsvp.count(),
    db.wish.count(),
    db.wish.count({ where: { flagged: true } }),
    db.loginEvent.findMany({ where: { ok: true, createdAt: { gte: d1 } }, distinct: ["userId"], select: { userId: true } }),
    db.loginEvent.findMany({ where: { ok: true, createdAt: { gte: d7 } }, distinct: ["userId"], select: { userId: true } }),
    db.aiUsage.count({ where: { createdAt: { gte: d1 } } }),
    db.loginEvent.findMany({ where: { createdAt: { gte: d14 } }, select: { createdAt: true, ok: true } }),
    db.securityEvent.findMany({ where: { createdAt: { gte: d1 } }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.payment.findMany({ where: { status: "paid" }, select: { amount: true, currency: true } }),
  ]);

  // Sign-ins per day (successful vs failed) for the last 14 days.
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * DAY);
    return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), ok: 0, fail: 0 };
  });
  for (const e of logins14) {
    const day = days.find((d) => d.key === e.createdAt.toISOString().slice(0, 10));
    if (day) {
      if (e.ok) day.ok++;
      else day.fail++;
    }
  }
  const max = Math.max(1, ...days.map((d) => d.ok + d.fail));

  // Sources with the most abuse signals in the last day.
  const byIp = new Map<string, number>();
  for (const e of events24) byIp.set(e.ipHash, (byIp.get(e.ipHash) ?? 0) + 1);
  const hot = [...byIp.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const revenue = paid.reduce((s, p) => s + p.amount, 0);
  const currency = paid[0]?.currency ?? (await getSetting("pay.currency"));
  const aiReady = !!(await getSetting("groq.apiKey")) && (await getBool("ai.enabled"));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-4xl">Overview</h1>
        {!aiReady && (
          <Link href="/admin/settings" className="rounded-full bg-amber-100 px-4 py-2 text-sm text-amber-900">
            AI is off until you add a Groq key →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Users" value={users} hint={`${newUsers} new this week`} />
        <Stat label="Signed in today" value={active24.length} hint={`${active7.length} this week`} />
        <Stat label="Sites" value={sites} hint={`${published} published · ${premium} premium`} />
        <Stat label="Revenue" value={money(revenue, currency)} hint={`${paid.length} payments`} />
        <Stat label="RSVPs" value={rsvps} />
        <Stat label="Guestbook messages" value={wishes} hint={flagged ? `${flagged} caught as spam` : undefined} />
        <Stat label="AI requests today" value={ai24} />
        <Stat label="Abuse signals today" value={events24.length} hint={hot.length ? `${hot.length} sources` : "All quiet"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card title="Sign-ins, last 14 days">
          <div className="flex h-44 items-end gap-1.5" role="img" aria-label="Daily sign-ins">
            {days.map((d) => (
              <div key={d.key} className="group relative flex flex-1 flex-col justify-end" title={`${d.label}: ${d.ok} ok, ${d.fail} failed`}>
                <div className="rounded-t bg-red-300" style={{ height: `${(d.fail / max) * 150}px` }} />
                <div className="rounded-t bg-ink" style={{ height: `${(d.ok / max) * 150}px` }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[0.65rem] text-stone">
            <span>{days[0].label}</span>
            <span className="flex gap-3">
              <span>
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-ink" />
                Successful
              </span>
              <span>
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-red-300" />
                Failed
              </span>
            </span>
            <span>Today</span>
          </div>
        </Card>

        <Card title="Watch list (24h)" action={<Link href="/admin/spam" className="text-sm text-stone underline">All</Link>}>
          {hot.length === 0 ? (
            <Empty>No suspicious activity.</Empty>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {hot.map(([ip, n]) => {
                const kinds = [...new Set(events24.filter((e) => e.ipHash === ip).map((e) => KIND_LABEL[e.kind] ?? e.kind))];
                return (
                  <li key={ip} className="flex items-start justify-between gap-3 py-2">
                    <span>
                      <span className="font-mono text-xs">source {ip.slice(0, 8)}</span>
                      <span className="block text-xs text-stone">{kinds.join(", ")}</span>
                    </span>
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700">{n}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Latest activity">
        {events24.length === 0 ? (
          <Empty>Nothing in the last day.</Empty>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {events24.slice(0, 8).map((e) => (
              <li key={e.id} className="flex justify-between gap-3 py-2">
                <span>
                  {KIND_LABEL[e.kind] ?? e.kind}
                  {e.scope && <span className="text-stone"> · {e.scope}</span>}
                  {e.detail && <span className="block truncate text-xs text-stone">{e.detail}</span>}
                </span>
                <span className="shrink-0 text-xs text-stone">{fmt(e.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
