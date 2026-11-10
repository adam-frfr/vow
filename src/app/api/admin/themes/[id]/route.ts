import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/admin-api";
import { forgetCatalog, getCatalog } from "@/lib/catalog";
import { themeInputSchema } from "@/lib/custom-theme";
import { db } from "@/lib/db";
import { unregisterTheme } from "@/lib/themes";
import { validateThemeRefs } from "../validate";

/** Saves edits to a builder theme and/or publishes or unpublishes it. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = z.object({ theme: themeInputSchema.optional(), status: z.enum(["draft", "published"]).optional() }).safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: body.error.issues[0]?.message ?? "Check the theme details." }, { status: 400 });
    const row = await db.customTheme.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (body.data.theme) {
      await getCatalog();
      const problem = await validateThemeRefs(body.data.theme);
      if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    }
    await db.customTheme.update({
      where: { id },
      data: { ...(body.data.theme ? { name: body.data.theme.name, data: JSON.stringify(body.data.theme) } : {}), ...(body.data.status ? { status: body.data.status } : {}) },
    });
    forgetCatalog();
    return NextResponse.json({ ok: true });
  });
}

/** Deletes a builder theme, unless a couple is using it (unpublish it instead). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const row = await db.customTheme.findUnique({ where: { id } });
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const used = await db.site.count({ where: { themeId: id } });
    if (used) return NextResponse.json({ error: `${used} site${used > 1 ? "s use" : " uses"} this theme. Unpublish it instead: they keep working and nobody new can pick it.` }, { status: 409 });
    await db.customTheme.delete({ where: { id } });
    unregisterTheme(id);
    forgetCatalog();
    return NextResponse.json({ ok: true });
  });
}
