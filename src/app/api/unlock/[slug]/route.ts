import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { guard } from "@/lib/security";
import { accessCookie, accessCookieOptions, signSiteAccess } from "@/lib/site-access";

/** Guest enters the site password. */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await guard(req, "unlock", 10, 60_000))) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }
  const { slug } = await params;
  const { data: site } = await supabase.from("Site").select("id, published, passwordHash").eq("slug", slug).maybeSingle();
  if (!site || !site.published || !site.passwordHash) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = z.object({ password: z.string().min(1).max(200) }).safeParse(await req.json().catch(() => null));
  if (!body.success || !(await bcrypt.compare(body.data.password, site.passwordHash))) {
    return NextResponse.json({ error: "That password isn't right." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(accessCookie(site.id), await signSiteAccess(site.id), accessCookieOptions);
  return res;
}
