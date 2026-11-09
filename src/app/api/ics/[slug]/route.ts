import { getUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseContent } from "@/lib/content";
import { hasSiteAccess } from "@/lib/site-access";

/** iCalendar escaping (RFC 5545 §3.3.11). */
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

function parseTime(t: string): [number, number] | null {
  const m = t.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const ap = m[3]?.toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return h < 24 && min < 60 ? [h, min] : null;
}

const p2 = (n: number) => String(n).padStart(2, "0");

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.site.findUnique({ where: { slug } });
  const userId = await getUserId();
  if (!site || (!site.published && userId !== site.userId)) return new Response("Not found", { status: 404 });
  if (!(await hasSiteAccess(site, userId))) return new Response("Forbidden", { status: 403 });

  const c = parseContent(site.content);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.date)) return new Response("No date set", { status: 404 });
  const [y, m, d] = c.date.split("-");
  const ev = c.details.ceremony.venue || c.details.ceremony.title ? c.details.ceremony : c.details.reception;
  const start = parseTime(ev.time);
  const title = `${c.partner1} & ${c.partner2}'s Wedding`;
  const location = [ev.venue, ev.address].filter(Boolean).join(", ");

  // Floating local time (no TZ) so it shows at the venue's wall-clock time; all-day if no time.
  let when: string[];
  if (start) {
    const end = Math.min(start[0] + 6, 23);
    when = [`DTSTART:${y}${m}${d}T${p2(start[0])}${p2(start[1])}00`, `DTEND:${y}${m}${d}T${p2(end)}${p2(start[1])}00`];
  } else {
    const next = new Date(Date.UTC(+y, +m - 1, +d + 1));
    when = [`DTSTART;VALUE=DATE:${y}${m}${d}`, `DTEND;VALUE=DATE:${next.getUTCFullYear()}${p2(next.getUTCMonth() + 1)}${p2(next.getUTCDate())}`];
  }
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vow//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${site.id}@vow`,
    `DTSTAMP:${stamp}`,
    ...when,
    `SUMMARY:${esc(title)}`,
    location ? `LOCATION:${esc(location)}` : "",
    `DESCRIPTION:${esc(`${c.headline ? c.headline + ", " : ""}${c.partner1} & ${c.partner2} ${c.tagline}.`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${site.slug}.ics"`,
    },
  });
}
