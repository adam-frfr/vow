import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { parseContent } from "@/lib/content";
import { rateLimit } from "@/lib/rate-limit";
import { getUserId } from "@/lib/auth";
import { hasSiteAccess } from "@/lib/site-access";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z.string().trim().email("Please check your email address.").max(200).optional(),
  attending: z.boolean(),
  guests: z.number().int().min(1).max(10).default(1),
  meal: z.string().max(60).optional(),
  message: z.string().max(1000).optional(),
  website: z.string().max(0, "Something went wrong. Please try again.").optional(), // honeypot: must be empty
});

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!rateLimit(req, "rsvp", 20, 60_000)) {
    return NextResponse.json({ error: "Too many responses. Please try again shortly." }, { status: 429 });
  }
  const { slug } = await params;
  const site = await db.site.findUnique({ where: { slug } });
  if (!site || !site.published) return NextResponse.json({ error: "This invitation isn't accepting RSVPs." }, { status: 404 });
  if (!(await hasSiteAccess(site, await getUserId()))) return NextResponse.json({ error: "This site is private." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your details." }, { status: 400 });
  const r = parsed.data;
  const content = parseContent(site.content);
  if (content.hidden.includes("rsvp")) return NextResponse.json({ error: "RSVPs are closed." }, { status: 400 });

  await db.rsvp.create({
    data: {
      siteId: site.id,
      name: r.name,
      email: r.email,
      attending: r.attending,
      guests: r.attending ? Math.min(r.guests, content.rsvp.maxGuests) : 0,
      meal: r.attending && r.meal && content.rsvp.mealOptions.includes(r.meal) ? r.meal : null,
      message: r.message,
    },
  });
  return NextResponse.json({ ok: true });
}
