import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/admin-api";
import { forgetCatalog } from "@/lib/catalog";
import { db } from "@/lib/db";
import { deleteObject } from "@/lib/storage";

const patch = z.object({
  name: z.string().trim().min(2).max(40).optional(),
  hidden: z.boolean().optional(),
  locked: z.boolean().optional(),
  move: z.enum(["up", "down"]).optional(),
});

/** Rename, hide/show, lock/unlock (Premium) or reorder a library section. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = patch.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: body.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    const all = await db.librarySection.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] });
    const i = all.findIndex((s) => s.id === id);
    if (i < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { move, ...rest } = body.data;
    await db.librarySection.update({ where: { id }, data: rest });
    if (move) {
      const j = move === "up" ? i - 1 : i + 1;
      if (j >= 0 && j < all.length) {
        const order = all.map((s) => s.id);
        [order[i], order[j]] = [order[j], order[i]];
        await db.$transaction(order.map((sid, k) => db.librarySection.update({ where: { id: sid }, data: { position: k + 1 } })));
      }
    }
    forgetCatalog();
    return NextResponse.json({ ok: true });
  });
}

/** Deletes a section. With items in it, `?withItems=1` deletes them too; otherwise it refuses. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const section = await db.librarySection.findUnique({ where: { id } });
    if (!section) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const items = await db.artAsset.findMany({ where: { section: id } });
    if (items.length && new URL(req.url).searchParams.get("withItems") !== "1") {
      return NextResponse.json({ error: `“${section.name}” still has ${items.length} item${items.length > 1 ? "s" : ""}.`, items: items.length }, { status: 409 });
    }
    for (const a of items) await deleteObject(`assets/library/${a.id}.${a.format === "lottie" ? "json" : "webp"}`);
    await db.artAsset.deleteMany({ where: { section: id } });
    await db.librarySection.delete({ where: { id } });
    forgetCatalog();
    return NextResponse.json({ ok: true, deleted: items.length });
  });
}
