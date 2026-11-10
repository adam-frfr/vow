import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseContent } from "@/lib/content";
import { DeleteRsvp, ThankYouNotes, WishModeration } from "./GuestActions";

export const metadata: Metadata = { title: "Guests" };

export default async function Guests({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const site = await db.site.findFirst({
    where: { id, userId: user.id },
    include: { rsvps: { orderBy: { createdAt: "desc" } }, wishes: { orderBy: { createdAt: "desc" } } },
  });
  if (!site) notFound();
  const c = parseContent(site.content);
  const yes = site.rsvps.filter((r) => r.attending);
  const headcount = yes.reduce((n, r) => n + r.guests, 0);
  const meals = yes.reduce<Record<string, number>>((m, r) => {
    if (r.meal) m[r.meal] = (m[r.meal] ?? 0) + r.guests;
    return m;
  }, {});

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <Link href={`/dashboard/sites/${site.id}`} className="text-sm text-stone hover:text-ink">
          ← Back to editor
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">
              {c.partner1} &amp; {c.partner2}
            </p>
            <h1 className="mt-2 font-serif text-5xl">Guest list</h1>
          </div>
          {site.rsvps.length > 0 && (
            <a href={`/api/sites/${site.id}/rsvps.csv`} className="btn btn-light">
              Download CSV
            </a>
          )}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Replies", site.rsvps.length],
            ["Attending", headcount],
            ["Declined", site.rsvps.length - yes.length],
            ["Meal choices", Object.entries(meals).map(([k, v]) => `${v} ${k}`).join(" · ") || "None yet"],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-2xl border border-line bg-white p-5">
              <div className="eyebrow">{label}</div>
              <div className={`mt-2 font-serif ${typeof value === "number" ? "text-4xl" : "text-lg"}`}>{value}</div>
            </div>
          ))}
        </div>

        {!site.published && (
          <p className="mt-8 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Your site is still a draft. Publish it from the editor so guests can RSVP.
          </p>
        )}

        <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-stone">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Reply</th>
                <th className="px-5 py-3 font-medium">Guests</th>
                <th className="px-5 py-3 font-medium">Meal</th>
                <th className="px-5 py-3 font-medium">Note</th>
                <th className="px-5 py-3 font-medium">Received</th>
                <th className="px-5 py-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {site.rsvps.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-stone">
                    No replies yet. They’ll appear here the moment guests respond.
                  </td>
                </tr>
              )}
              {site.rsvps.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3">
                    <div className="font-medium">{r.name}</div>
                    {r.email && <div className="text-xs text-stone">{r.email}</div>}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${r.attending ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-600"}`}
                    >
                      {r.attending ? "Attending" : "Declined"}
                    </span>
                  </td>
                  <td className="px-5 py-3">{r.attending ? r.guests : "—"}</td>
                  <td className="px-5 py-3">{r.meal ?? "—"}</td>
                  <td className="max-w-xs px-5 py-3 text-stone">{r.message}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-stone">{r.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                  <td className="px-5 py-3 text-right">
                    <DeleteRsvp id={r.id} name={r.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-16 font-serif text-4xl">Thank-you notes</h2>
        <p className="mb-6 mt-1 text-stone">After the wedding: a personal draft for every guest who replied, ready to copy into a card or message.</p>
        <ThankYouNotes siteId={site.id} hasGuests={site.rsvps.length > 0} />

        <h2 className="mt-16 font-serif text-4xl">Guestbook</h2>
        <p className="mb-6 mt-1 text-stone">Notes guests left on your site. Hidden notes don&rsquo;t appear publicly.</p>
        <WishModeration
          wishes={site.wishes.map((w) => ({ id: w.id, name: w.name, message: w.message, hidden: w.hidden, flagged: w.flagged, createdAt: w.createdAt.toISOString() }))}
        />
      </main>
    </>
  );
}
