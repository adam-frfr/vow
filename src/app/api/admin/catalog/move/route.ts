import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/admin-api";
import { getCatalog, getMeta, setMeta } from "@/lib/catalog";
import { getTheme, isThemeId } from "@/lib/themes";

/** Moves a theme into another collection (built-in themes keep their original as the default). */
export async function PATCH(req: Request) {
  return withAdmin(async () => {
    const body = z.object({ id: z.string().max(80), collection: z.string().max(60) }).safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const cat = await getCatalog();
    if (!isThemeId(body.data.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!cat.collections.some((c) => c.id === body.data.collection)) return NextResponse.json({ error: "Unknown collection." }, { status: 400 });
    const meta = await getMeta();
    if (getTheme(body.data.id).collection === body.data.collection) delete meta.themeCollection[body.data.id];
    else meta.themeCollection[body.data.id] = body.data.collection;
    await setMeta(meta);
    return NextResponse.json({ ok: true });
  });
}
