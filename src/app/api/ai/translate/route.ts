import { NextResponse } from "next/server";
import { z } from "zod";
import { translateSite } from "@/lib/ai";
import { aiForSite } from "@/lib/ai-route";
import { parseContent, parseCustomization, SECTION_LABELS } from "@/lib/content";
import { db } from "@/lib/db";

/** Translate the site's wording into a second language and save it (guests switch on the live site). */
export async function POST(req: Request) {
  const p = z
    .object({ siteId: z.string(), language: z.string().trim().min(2).max(40).regex(/^[\p{L} ()-]+$/u) })
    .safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Pick a language." }, { status: 400 });
  return aiForSite(req, "translate", p.data.siteId, async (site) => {
    const c = parseContent(site.content);
    const titles = Object.fromEntries(Object.entries(SECTION_LABELS).map(([k, v]) => [k, c.titles[k as keyof typeof c.titles] || v]));
    const r = await translateSite(c, p.data.language, titles);
    const translation = { lang: p.data.language, fields: r.translation };
    // Re-read so a save from the editor in the meantime isn't overwritten.
    const fresh = await db.site.findUnique({ where: { id: site.id }, select: { customization: true } });
    const cz = parseCustomization(fresh?.customization ?? site.customization);
    await db.site.update({ where: { id: site.id }, data: { customization: JSON.stringify({ ...cz, translation }) } });
    return { body: { translation }, tokens: r.tokens };
  });
}
