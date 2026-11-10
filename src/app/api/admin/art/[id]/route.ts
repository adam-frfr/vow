import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/admin-api";
import { forgetCatalog } from "@/lib/catalog";
import { db } from "@/lib/db";
import { deleteObject } from "@/lib/storage";

/** Deletes uploaded art. Sites that placed it lose that piece; hiding is the gentler option. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const art = await db.artAsset.findUnique({ where: { id } });
    if (!art) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await deleteObject(`assets/library/${id}.webp`);
    await db.artAsset.delete({ where: { id } });
    forgetCatalog();
    return NextResponse.json({ ok: true });
  });
}
