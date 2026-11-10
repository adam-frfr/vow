import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/admin-api";
import { getCatalog, getMeta, setMeta } from "@/lib/catalog";
import { isThemeId, TEMPLATE_IDS } from "@/lib/themes";

/** Makes a theme or design Premium-only (enforced only while payments are on). */
export async function PATCH(req: Request) {
  return withAdmin(async () => {
    const body = z.object({ target: z.enum(["themes", "designs"]), id: z.string().max(80), locked: z.boolean() }).safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const { target, id, locked } = body.data;
    await getCatalog();
    if (target === "themes" ? !isThemeId(id) : !(TEMPLATE_IDS as string[]).includes(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const meta = await getMeta();
    const set = new Set(meta.locked[target]);
    if (locked) set.add(id);
    else set.delete(id);
    meta.locked[target] = [...set];
    await setMeta(meta);
    return NextResponse.json({ ok: true });
  });
}
