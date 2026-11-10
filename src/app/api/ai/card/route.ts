import { NextResponse } from "next/server";
import { z } from "zod";
import { draftCard, TONES } from "@/lib/ai";
import { aiForSite } from "@/lib/ai-route";
import { parseContent } from "@/lib/content";

/** Suggest wording for the printed invitation card. */
export async function POST(req: Request) {
  const p = z.object({ siteId: z.string(), tone: z.enum(TONES).default("warm") }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  return aiForSite(req, "card", p.data.siteId, async (site) => {
    const r = await draftCard(parseContent(site.content), p.data.tone);
    return { body: r.lines, tokens: r.tokens };
  });
}
