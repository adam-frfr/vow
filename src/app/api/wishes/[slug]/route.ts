import { NextResponse } from "next/server";
import { z } from "zod";
import { classifySpam, looksSpammy } from "@/lib/ai";
import { getUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
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
  const { data: site } = await supabase
    .from("Site")
    .select("*, user:User(blocked)")
    .eq("slug", slug)
    .maybeSingle();

  if (!(await guard(req, "wish", 8, 60_000, site?.id))) {
    return NextResponse.json({ error: "Too many messages. Please try again shortly." }, { status: 429 });
  }

  const isBlocked = (site?.user as { blocked?: boolean })?.blocked;
  if (!site || !site.published || isBlocked) return NextResponse.json({ error: "This guestbook isn't open." }, { status: 404 });
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

  const id = "w_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  const { data: wish } = await supabase.from("Wish").insert({
    id,
    siteId: site.id,
    name,
    message,
    hidden: spam,
    flagged: spam,
    ipHash: ipHashOf(req),
  }).select().single();

  if (spam) await logSecurity(req, "spam", "guestbook", { siteId: site.id, detail: `${reason}: ${message}` });
  return NextResponse.json({ wish: { id: wish?.id ?? id, name, message, createdAt: new Date().toISOString() } });
}
