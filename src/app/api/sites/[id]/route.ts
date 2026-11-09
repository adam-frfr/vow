import { NextResponse } from "next/server";
import { z } from "zod";
import { getOwnedSite } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentSchema, customizationSchema, RESERVED_SLUGS, slugify } from "@/lib/content";
import { isThemeId } from "@/lib/themes";
import { deleteStored } from "@/lib/storage";

const patchSchema = z.object({
  themeId: z.string().refine(isThemeId).optional(),
  content: contentSchema.optional(),
  customization: customizationSchema.optional(),
  published: z.boolean().optional(),
  slug: z.string().max(48).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await getOwnedSite(id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const body = parsed.data;

  let slug: string | undefined;
  if (body.slug !== undefined && body.slug !== site.slug) {
    slug = slugify(body.slug);
    if (slug.length < 3) return NextResponse.json({ error: "Link must be at least 3 characters." }, { status: 400 });
    if (RESERVED_SLUGS.has(slug)) return NextResponse.json({ error: "That link is reserved." }, { status: 400 });
    const taken = await db.site.findUnique({ where: { slug }, select: { id: true } });
    if (taken && taken.id !== site.id) return NextResponse.json({ error: "That link is already taken." }, { status: 409 });
  }

  const updated = await db.site.update({
    where: { id: site.id },
    data: {
      themeId: body.themeId,
      content: body.content ? JSON.stringify(body.content) : undefined,
      customization: body.customization ? JSON.stringify(body.customization) : undefined,
      published: body.published,
      slug,
    },
  });
  return NextResponse.json({ ok: true, slug: updated.slug, published: updated.published, updatedAt: updated.updatedAt });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await getOwnedSite(id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const photos = await db.photo.findMany({ where: { siteId: site.id } });
  await db.site.delete({ where: { id: site.id } });
  await Promise.all(photos.map((p) => deleteStored(p.storageKey)));
  return NextResponse.json({ ok: true });
}
