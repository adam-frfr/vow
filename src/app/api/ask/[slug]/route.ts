import { NextResponse } from "next/server";
import { z } from "zod";
import { answerGuest } from "@/lib/ai";
import { getUserId } from "@/lib/auth";
import { parseContent } from "@/lib/content";
import { db } from "@/lib/db";
import { guestQuestionsToday, recordAi } from "@/lib/groq";
import { guard } from "@/lib/security";
import { getInt } from "@/lib/settings";
import { helperAvailable } from "@/lib/helper";
import { hasSiteAccess } from "@/lib/site-access";

/** "Ask us anything" on a live site: answers only from the couple's own content. */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.site.findUnique({ where: { slug }, include: { user: { select: { blocked: true } } } });
  if (!site || !site.published || site.user.blocked) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await guard(req, "ask", 8, 60_000, site.id))) return NextResponse.json({ error: "Please wait a moment before asking again." }, { status: 429 });
  if (!(await hasSiteAccess(site, await getUserId()))) return NextResponse.json({ error: "This site is private." }, { status: 403 });
  if (!(await helperAvailable(site))) return NextResponse.json({ error: "The helper isn't available on this site." }, { status: 404 });
  if ((await guestQuestionsToday(site.id)) >= (await getInt("ai.guestDailyLimit"))) {
    return NextResponse.json({ error: "The helper has answered a lot today. Please contact the couple directly." }, { status: 429 });
  }
  const p = z.object({ question: z.string().trim().min(2).max(300) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Please type a question." }, { status: 400 });
  try {
    const r = await answerGuest(parseContent(site.content), p.data.question);
    await recordAi("guest-helper", { siteId: site.id, tokens: r.tokens });
    return NextResponse.json({ answer: r.text });
  } catch {
    await recordAi("guest-helper", { siteId: site.id, ok: false });
    return NextResponse.json({ error: "The helper isn't available right now. Please try again later." }, { status: 503 });
  }
}
