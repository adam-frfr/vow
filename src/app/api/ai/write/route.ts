import { NextResponse } from "next/server";
import { z } from "zod";
import { DRAFTS, draftFaq, draftField, REWRITES, rewrite, TONES, type DraftField } from "@/lib/ai";
import { aiForSite } from "@/lib/ai-route";
import { parseContent } from "@/lib/content";

const schema = z.object({
  siteId: z.string(),
  field: z.enum([...(Object.keys(DRAFTS) as [DraftField, ...DraftField[]]), "faq"]),
  mode: z.enum(["draft", "rewrite"]),
  tone: z.enum(TONES).default("warm"),
  how: z.enum(Object.keys(REWRITES) as [keyof typeof REWRITES, ...(keyof typeof REWRITES)[]]).optional(),
  text: z.string().max(4000).optional(),
  answers: z.object({ howMet: z.string().max(600), proposal: z.string().max(600), extra: z.string().max(600) }).partial().optional(),
});

/** Writing assistant: draft a section from the wedding facts, or rewrite the couple's text. */
export async function POST(req: Request) {
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const b = p.data;
  return aiForSite(req, `write:${b.field}:${b.mode}`, b.siteId, async (site) => {
    const c = parseContent(site.content);
    if (b.field === "faq") {
      const r = await draftFaq(c, b.tone);
      return { body: { items: r.items }, tokens: r.tokens };
    }
    if (b.mode === "rewrite") {
      if (!b.text?.trim()) return { body: { text: "" }, tokens: 0 };
      const r = await rewrite(b.text, b.how ?? "fix", DRAFTS[b.field].max);
      return { body: { text: r.text }, tokens: r.tokens };
    }
    const r = await draftField(c, b.field, b.tone, b.answers);
    return { body: { text: r.text }, tokens: r.tokens };
  });
}
