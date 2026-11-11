import "server-only";
import { NextResponse } from "next/server";
import { getUserId } from "./auth";
import { supabase } from "./supabase";
import { AiError, assertAiAllowed, recordAi } from "./groq";
import { guard } from "./security";

interface Site {
  id: string;
  userId: string;
  slug: string;
  themeId: string;
  content: string;
  customization: string;
  published: boolean;
  passwordHash?: string | null;
  premium: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shared plumbing for the couple's AI endpoints: signed in, owns the site,
 * AI allowed (enabled, key set, premium if required, daily limit), then logs usage.
 */
export async function aiForSite(
  req: Request,
  feature: string,
  siteId: unknown,
  fn: (site: Site, userId: string) => Promise<{ body: object; tokens: number }>,
) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!(await guard(req, "ai", 20, 60_000))) return NextResponse.json({ error: "Slow down a little and try again in a minute." }, { status: 429 });
  
  if (typeof siteId !== "string") return NextResponse.json({ error: "Site not found." }, { status: 404 });
  const { data: site } = await supabase.from("Site").select("*").eq("id", siteId).eq("userId", userId).maybeSingle();
  if (!site) return NextResponse.json({ error: "Site not found." }, { status: 404 });
  try {
    await assertAiAllowed(userId, site);
    const { body, tokens } = await fn(site, userId);
    await recordAi(feature, { userId, siteId: site.id, tokens });
    return NextResponse.json(body);
  } catch (e) {
    if (e instanceof AiError) {
      if (e.status !== 429 && e.status !== 402) await recordAi(feature, { userId, siteId: site.id, ok: false });
      return NextResponse.json({ error: e.message, code: e.status === 402 ? "premium" : undefined }, { status: e.status });
    }
    console.error("AI route failed", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
