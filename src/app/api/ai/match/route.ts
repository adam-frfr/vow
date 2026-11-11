import { NextResponse } from "next/server";
import { z } from "zod";
import { matchThemes } from "@/lib/ai";
import { getUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { AiError, recordAi } from "@/lib/groq";
import { guard } from "@/lib/security";
import { getBool, getInt, getSetting } from "@/lib/settings";

/** Theme matchmaker: describe the wedding, get 3 themes. Works before a site exists. */
export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!(await guard(req, "ai", 20, 60_000))) return NextResponse.json({ error: "Slow down a little and try again in a minute." }, { status: 429 });
  const p = z
    .object({ description: z.string().trim().min(8, "Tell us a little more about your wedding.").max(600) })
    .safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  if (!(await getBool("ai.enabled")) || !(await getSetting("groq.apiKey"))) {
    return NextResponse.json({ error: "The theme matchmaker isn't available right now." }, { status: 503 });
  }
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { count: usageCount } = await supabase
    .from("AiUsage")
    .select("*", { count: "exact", head: true })
    .eq("userId", userId)
    .gte("createdAt", since.toISOString());
  if ((usageCount ?? 0) >= (await getInt("ai.dailyLimit"))) {
    return NextResponse.json({ error: "You've used today's AI requests. They reset at midnight." }, { status: 429 });
  }
  try {
    const r = await matchThemes(p.data.description);
    await recordAi("match", { userId, tokens: r.tokens });
    return NextResponse.json({ picks: r.picks });
  } catch (e) {
    await recordAi("match", { userId, ok: false });
    return NextResponse.json({ error: e instanceof AiError ? e.message : "Something went wrong." }, { status: e instanceof AiError ? e.status : 500 });
  }
}
