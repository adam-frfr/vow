import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/admin-api";
import { ALL_FLORALS } from "@/lib/assets";
import { getCatalog, setHidden } from "@/lib/catalog";
import { isThemeId, TEMPLATE_IDS } from "@/lib/themes";

/** Show or hide a theme, a design or a piece of art everywhere couples pick them. */
export async function PATCH(req: Request) {
  return withAdmin(async () => {
    const body = z.object({ kind: z.enum(["themes", "designs", "art"]), id: z.string().max(80), hidden: z.boolean() }).safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const { kind, id, hidden } = body.data;
    await getCatalog();
    const exists = kind === "themes" ? isThemeId(id) : kind === "designs" ? (TEMPLATE_IDS as string[]).includes(id) : ALL_FLORALS.some((a) => a.id === id);
    if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await setHidden(kind, id, hidden);
    return NextResponse.json({ ok: true });
  });
}
