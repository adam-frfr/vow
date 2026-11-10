import { NextResponse } from "next/server";
import { z } from "zod";
import { thankYouNotes, TONES } from "@/lib/ai";
import { aiForSite } from "@/lib/ai-route";
import { parseContent } from "@/lib/content";
import { db } from "@/lib/db";

/** Draft a personal thank-you note for each guest who replied. */
export async function POST(req: Request) {
  const p = z.object({ siteId: z.string(), tone: z.enum(TONES).default("warm") }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  return aiForSite(req, "thanks", p.data.siteId, async (site) => {
    const [rsvps, wishes] = await Promise.all([
      db.rsvp.findMany({ where: { siteId: site.id }, orderBy: { createdAt: "asc" }, take: 60 }),
      db.wish.findMany({ where: { siteId: site.id, hidden: false }, take: 200 }),
    ]);
    if (rsvps.length === 0) return { body: { notes: [] }, tokens: 0 };
    const wishOf = (name: string) => wishes.find((w) => w.name.trim().toLowerCase() === name.trim().toLowerCase())?.message;
    const r = await thankYouNotes(
      parseContent(site.content),
      rsvps.map((g) => ({ name: g.name, message: g.message, attending: g.attending, wish: wishOf(g.name) })),
      p.data.tone,
    );
    return { body: { notes: r.notes }, tokens: r.tokens };
  });
}
