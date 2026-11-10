import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/admin-api";
import { getCatalog, getDraftThemes, getMeta, setMeta } from "@/lib/catalog";
import { THEMES } from "@/lib/themes";

const NAME = z.string().trim().min(2, "Give the collection a name.").max(40);
const BLURB = z.string().trim().max(160);

/** Creates a collection (a tab in the theme gallery). */
export async function POST(req: Request) {
  return withAdmin(async () => {
    const body = z.object({ name: NAME, blurb: BLURB.default("") }).safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: body.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    const meta = await getMeta();
    const slug = body.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) || "collection";
    const id = `k-${slug}-${randomBytes(2).toString("hex")}`;
    meta.collections.custom.push({ id, name: body.data.name, blurb: body.data.blurb });
    await setMeta(meta);
    return NextResponse.json({ id });
  });
}

/** Rename, describe, hide/show or reorder any collection (built-in ones too). */
export async function PATCH(req: Request) {
  return withAdmin(async () => {
    const body = z
      .object({ id: z.string().max(60), name: NAME.optional(), blurb: BLURB.optional(), hidden: z.boolean().optional(), move: z.enum(["up", "down"]).optional() })
      .safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: body.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    const cat = await getCatalog();
    const current = cat.collections.find((c) => c.id === body.data.id);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const meta = await getMeta();
    const { id, name, blurb, hidden, move } = body.data;
    if (name !== undefined || blurb !== undefined) {
      const custom = meta.collections.custom.find((c) => c.id === id);
      if (custom) Object.assign(custom, { ...(name !== undefined ? { name } : {}), ...(blurb !== undefined ? { blurb } : {}) });
      else meta.collections.names[id] = { name: name ?? current.name, blurb: blurb ?? current.blurb };
    }
    if (hidden !== undefined) meta.collections.hidden = hidden ? [...new Set([...meta.collections.hidden, id])] : meta.collections.hidden.filter((x) => x !== id);
    if (move) {
      const order = cat.collections.map((c) => c.id);
      const i = order.indexOf(id);
      const j = move === "up" ? i - 1 : i + 1;
      if (j >= 0 && j < order.length) [order[i], order[j]] = [order[j], order[i]];
      meta.collections.order = order;
    }
    await setMeta(meta);
    return NextResponse.json({ ok: true });
  });
}

/** Deletes a collection you made, once no theme is in it. */
export async function DELETE(req: Request) {
  return withAdmin(async () => {
    const id = new URL(req.url).searchParams.get("id") ?? "";
    const meta = await getMeta();
    if (!meta.collections.custom.some((c) => c.id === id)) return NextResponse.json({ error: "Only collections you created can be deleted. Built-in ones can be hidden." }, { status: 400 });
    const cat = await getCatalog();
    const drafts = await getDraftThemes();
    const inIt = [...THEMES, ...drafts].filter((t) => (cat.themeCollection[t.id] ?? t.collection) === id).length;
    if (inIt) return NextResponse.json({ error: `Move its ${inIt} theme${inIt > 1 ? "s" : ""} to another collection first.` }, { status: 409 });
    meta.collections.custom = meta.collections.custom.filter((c) => c.id !== id);
    meta.collections.hidden = meta.collections.hidden.filter((x) => x !== id);
    meta.collections.order = meta.collections.order.filter((x) => x !== id);
    delete meta.collections.names[id];
    await setMeta(meta);
    return NextResponse.json({ ok: true });
  });
}
