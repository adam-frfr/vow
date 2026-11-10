import "server-only";
import { NextResponse } from "next/server";
import { getUserId } from "./auth";
import { db } from "./db";
import { AiError, assertAiAllowed, recordAi } from "./groq";
import { guard } from "./security";

type Site = NonNullable<Awaited<ReturnType<typeof db.site.findFirst>>>;

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
  const site = typeof siteId === "string" ? await db.site.findFirst({ where: { id: siteId, userId } }) : null;
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
