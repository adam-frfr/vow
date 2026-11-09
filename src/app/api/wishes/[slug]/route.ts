import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseContent } from "@/lib/content";
import { rateLimit } from "@/lib/rate-limit";
import { hasSiteAccess } from "@/lib/site-access";

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name.").max(80),
  message: z.string().trim().min(1, "Please write a message.").max(500),
  website: z.string().max(0, "Something went wrong. Please try again.").optional(), // honeypot
});

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!rateLimit(req, "wish", 8, 60_000)) {
    return NextResponse.json({ error: "Too many messages. Please try again shortly." }, { status: 429 });
  }
  const { slug } = await params;
  const site = await db.site.findUnique({ where: { slug } });
  if (!site || !site.published) return NextResponse.json({ error: "This guestbook isn't open." }, { status: 404 });
  if (!(await hasSiteAccess(site, await getUserId()))) return NextResponse.json({ error: "This site is private." }, { status: 403 });
  if (parseContent(site.content).hidden.includes("wishes")) return NextResponse.json({ error: "The guestbook is closed." }, { status: 400 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your message." }, { status: 400 });

  const wish = await db.wish.create({ data: { siteId: site.id, name: parsed.data.name, message: parsed.data.message } });
  return NextResponse.json({ wish: { id: wish.id, name: wish.name, message: wish.message, createdAt: wish.createdAt.toISOString() } });
}
