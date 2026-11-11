import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";
import { catalogProblem } from "@/lib/locks";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
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

  await getCatalog(); // registers builder themes so they validate
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const { themeId, partner1, partner2, date } = parsed.data;
  const problem = await catalogProblem(null, { themeId });
  if (problem) return NextResponse.json({ error: problem.error, code: problem.status === 402 ? "premium" : undefined }, { status: problem.status });

  const base = slugify(parsed.data.slug || `${partner1}-and-${partner2}`) || "our-wedding";
  const slug = await uniqueSlug(base);
  const id = "s_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

  const { data: site, error } = await supabase.from("Site").insert({
    id,
    userId,
    themeId,
    slug,
    content: JSON.stringify(starterContent(partner1, partner2, date)),
    customization: "{}",
    published: false,
  }).select("id, slug").single();

  if (error || !site) {
    console.error("[create site error]", error);
    return NextResponse.json({ error: "Could not create site." }, { status: 500 });
  }

  return NextResponse.json({ id: site.id, slug: site.slug });
}

async function uniqueSlug(base: string) {
  let slug = RESERVED_SLUGS.has(base) ? `${base}-wedding` : base;
  for (let i = 2; ; i++) {
    const { data } = await supabase.from("Site").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${base}-${i}`;
  }
  return slug;
}
