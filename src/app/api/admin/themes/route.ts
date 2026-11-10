import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/admin-api";
import { forgetCatalog, getCatalog } from "@/lib/catalog";
import { themeInputSchema } from "@/lib/custom-theme";
import { db } from "@/lib/db";
import { validateThemeRefs } from "./validate";

/** Creates a theme in the theme builder (a draft unless published straight away). */
export async function POST(req: Request) {
  return withAdmin(async () => {
    const body = z.object({ theme: themeInputSchema, publish: z.boolean().default(false) }).safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: body.error.issues[0]?.message ?? "Check the theme details." }, { status: 400 });
    await getCatalog();
    const problem = await validateThemeRefs(body.data.theme);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    const slug = body.data.theme.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "theme";
    const id = `u-${slug}-${randomBytes(2).toString("hex")}`;
    await db.customTheme.create({ data: { id, name: body.data.theme.name, status: body.data.publish ? "published" : "draft", data: JSON.stringify(body.data.theme) } });
    forgetCatalog();
    return NextResponse.json({ id });
  });
}
