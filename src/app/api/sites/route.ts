import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { RESERVED_SLUGS, slugify, starterContent } from "@/lib/content";
import { isThemeId } from "@/lib/themes";

const schema = z.object({
  themeId: z.string().refine(isThemeId, "Unknown theme"),
  partner1: z.string().trim().min(1).max(60),
  partner2: z.string().trim().min(1).max(60),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  slug: z.string().trim().max(48).optional(),
});

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const { themeId, partner1, partner2, date } = parsed.data;

  const base = slugify(parsed.data.slug || `${partner1}-and-${partner2}`) || "our-wedding";
  const slug = await uniqueSlug(base);

  const site = await db.site.create({
    data: {
      userId,
      themeId,
      slug,
      content: JSON.stringify(starterContent(partner1, partner2, date)),
    },
  });
  return NextResponse.json({ id: site.id, slug: site.slug });
}

async function uniqueSlug(base: string) {
  let slug = RESERVED_SLUGS.has(base) ? `${base}-wedding` : base;
  for (let i = 2; await db.site.findUnique({ where: { slug }, select: { id: true } }); i++) {
    slug = `${base}-${i}`;
  }
  return slug;
}
