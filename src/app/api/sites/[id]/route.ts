import { NextResponse } from "next/server";
import { needsPremium } from "@/lib/stripe";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getOwnedSite } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { contentSchema, customizationSchema, RESERVED_SLUGS, slugify } from "@/lib/content";
import { isThemeId } from "@/lib/themes";
import { deleteStored } from "@/lib/storage";
import { getCatalog } from "@/lib/catalog";
import { catalogProblem } from "@/lib/locks";

const patchSchema = z.object({
  themeId: z.string().refine(isThemeId).optional(),
  content: contentSchema.optional(),
  customization: customizationSchema.optional(),
  published: z.boolean().optional(),
  slug: z.string().max(48).optional(),
  /** string sets a guest password, null removes it */
  password: z.string().min(4, "Use at least 4 characters.").max(100).nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await getOwnedSite(id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await getCatalog(); // registers builder themes so they validate
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const body = parsed.data;

  const problem = await catalogProblem(site, { themeId: body.themeId, customization: body.customization });
  if (problem) return NextResponse.json({ error: problem.error, code: problem.status === 402 ? "premium" : undefined }, { status: problem.status });

  if (typeof body.password === "string" && (await needsPremium("password", site))) {
    return NextResponse.json({ error: "Password protection is part of Premium. Upgrade this site to use it.", code: "premium" }, { status: 402 });
  }

  let slug: string | undefined;
  if (body.slug !== undefined && body.slug !== site.slug) {
    slug = slugify(body.slug);
    if (slug.length < 3) return NextResponse.json({ error: "Link must be at least 3 characters." }, { status: 400 });
    if (RESERVED_SLUGS.has(slug)) return NextResponse.json({ error: "That link is reserved." }, { status: 400 });
    const { data: taken } = await supabase.from("Site").select("id").eq("slug", slug).maybeSingle();
    if (taken && taken.id !== site.id) return NextResponse.json({ error: "That link is already taken." }, { status: 409 });
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (body.themeId !== undefined) updateData.themeId = body.themeId;
  if (body.content !== undefined) updateData.content = JSON.stringify(body.content);
  if (body.customization !== undefined) updateData.customization = JSON.stringify(body.customization);
  if (body.published !== undefined) updateData.published = body.published;
  if (slug !== undefined) updateData.slug = slug;
  if (body.password !== undefined) {
    updateData.passwordHash = body.password === null ? null : await bcrypt.hash(body.password, 10);
  }

  const { data: updated, error } = await supabase
    .from("Site")
    .update(updateData)
    .eq("id", site.id)
    .select()
    .single();

  if (error || !updated) {
    console.error("[update site error]", error);
    return NextResponse.json({ error: "Could not save changes." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    slug: updated.slug,
    published: updated.published,
    protected: !!updated.passwordHash,
    updatedAt: updated.updatedAt,
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const site = await getOwnedSite(id);
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data: photos } = await supabase.from("Photo").select("storageKey").eq("siteId", site.id);
  await supabase.from("Site").delete().eq("id", site.id);
  if (photos && photos.length > 0) {
    await Promise.all(photos.map((p) => deleteStored(p.storageKey)));
  }
  return NextResponse.json({ ok: true });
}
