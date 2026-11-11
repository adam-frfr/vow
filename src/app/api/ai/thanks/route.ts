import { NextResponse } from "next/server";
import { z } from "zod";
import { thankYouNotes, TONES } from "@/lib/ai";
import { aiForSite } from "@/lib/ai-route";
import { parseContent } from "@/lib/content";
import { supabase } from "@/lib/supabase";

/** Draft a personal thank-you note for each guest who replied. */
export async function POST(req: Request) {
  const p = z.object({ siteId: z.string(), tone: z.enum(TONES).default("warm") }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  return aiForSite(req, "thanks", p.data.siteId, async (site) => {
    const [{ data: rsvps }, { data: wishes }] = await Promise.all([
      supabase.from("Rsvp").select("*").eq("siteId", site.id).order("createdAt", { ascending: true }).limit(60),
      supabase.from("Wish").select("*").eq("siteId", site.id).eq("hidden", false).limit(200),
    ]);
    const rsvpList = (rsvps ?? []) as Array<{ name: string; message?: string | null; attending: boolean }>;
    const wishList = (wishes ?? []) as Array<{ name: string; message: string }>;
    if (rsvpList.length === 0) return { body: { notes: [] }, tokens: 0 };
    const wishOf = (name: string) => wishList.find((w) => w.name.trim().toLowerCase() === name.trim().toLowerCase())?.message;
    const r = await thankYouNotes(
      parseContent(site.content),
      rsvpList.map((g) => ({ name: g.name, message: g.message, attending: g.attending, wish: wishOf(g.name) })),
      p.data.tone,
    );
    return { body: { notes: r.notes }, tokens: r.tokens };
  });
}
