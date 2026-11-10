import { NextResponse } from "next/server";
import { z } from "zod";
import { classifySpam, looksSpammy } from "@/lib/ai";
import { getUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseContent } from "@/lib/content";
import { recordAi } from "@/lib/groq";
import { guard, ipHashOf, logSecurity } from "@/lib/security";
import { getBool, getSetting } from "@/lib/settings";
import { hasSiteAccess } from "@/lib/site-access";

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name.").max(80),
  message: z.string().trim().min(1, "Please write a message.").max(500),
  website: z.string().max(200).optional(), // honeypot: real guests never see this field
});

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.site.findUnique({ where: { slug }, include: { user: { select: { blocked: true } } } });
  if (!(await guard(req, "wish", 8, 60_000, site?.id))) {
    return NextResponse.json({ error: "Too many messages. Please try again shortly." }, { status: 429 });
  }
  if (!site || !site.published || site.user.blocked) return NextResponse.json({ error: "This guestbook isn't open." }, { status: 404 });
  if (!(await hasSiteAccess(site, await getUserId()))) return NextResponse.json({ error: "This site is private." }, { status: 403 });
  if (parseContent(site.content).hidden.includes("wishes")) return NextResponse.json({ error: "The guestbook is closed." }, { status: 400 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your message." }, { status: 400 });
  const { name, message, website } = parsed.data;

  if (website) {
    await logSecurity(req, "honeypot", "guestbook", { siteId: site.id, detail: `${name}: ${message}` });
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  }

  // Spam check: obvious patterns first, then the AI filter if it's on. Fails open.
  let spam = looksSpammy(name, message);
  let reason = spam ? "links or spam words" : "";
  if (!spam && (await getBool("ai.spamFilter")) && (await getBool("ai.enabled")) && (await getSetting("groq.apiKey"))) {
    try {
      const r = await classifySpam(name, message);
      await recordAi("spam-filter", { siteId: site.id, tokens: r.tokens });
      spam = r.spam;
      reason = r.reason;
    } catch {
      await recordAi("spam-filter", { siteId: site.id, ok: false });
    }
  }

  const wish = await db.wish.create({ data: { siteId: site.id, name, message, hidden: spam, flagged: spam, ipHash: ipHashOf(req) } });
  if (spam) await logSecurity(req, "spam", "guestbook", { siteId: site.id, detail: `${reason}: ${message}` });
  // Spam is quietly held back; the sender isn't told (so bots learn nothing).
  return NextResponse.json({ wish: { id: wish.id, name: wish.name, message: wish.message, createdAt: wish.createdAt.toISOString() } });
}
