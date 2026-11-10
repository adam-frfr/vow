import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/admin-api";
import { AiError, testGroq } from "@/lib/groq";
import { getSetting } from "@/lib/settings";

/** Test a Groq key (the one typed, or the saved one) before/after saving it. */
export async function POST(req: Request) {
  return withAdmin(async () => {
    const body = z.object({ key: z.string().max(200).optional(), model: z.string().max(80).optional() }).safeParse(await req.json().catch(() => ({})));
    if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const key = body.data.key?.trim() || (await getSetting("groq.apiKey"));
    if (!key) return NextResponse.json({ error: "Add a Groq key first." }, { status: 400 });
    try {
      const r = await testGroq(key, body.data.model?.trim() || (await getSetting("groq.model")));
      return NextResponse.json({ ok: true, models: r.models });
    } catch (e) {
      return NextResponse.json({ error: e instanceof AiError ? e.message : "Couldn't reach Groq." }, { status: 400 });
    }
  });
}
