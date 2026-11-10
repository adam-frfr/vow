import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/admin-api";
import { forgetCatalog } from "@/lib/catalog";
import { db } from "@/lib/db";
import { deleteObject } from "@/lib/storage";

/** Moves uploaded art to another section (or back to the built-in kinds) and renames it. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = z.object({ name: z.string().trim().min(1).max(60).optional(), section: z.string().max(40).nullable().optional() }).safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const art = await db.artAsset.findUnique({ where: { id } });
    if (!art) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (body.data.section && !(await db.librarySection.findUnique({ where: { id: body.data.section } }))) {
      return NextResponse.json({ error: "That section no longer exists." }, { status: 400 });
    }
    if (body.data.section === null && art.format === "lottie") return NextResponse.json({ error: "Animations live in a section of their own." }, { status: 400 });
    await db.artAsset.update({ where: { id }, data: { name: body.data.name, section: body.data.section } });
    forgetCatalog();
    return NextResponse.json({ ok: true });
  });
}

/** Deletes uploaded art. Sites that placed it lose that piece; hiding is the gentler option. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const art = await db.artAsset.findUnique({ where: { id } });
    if (!art) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await deleteObject(`assets/library/${id}.${art.format === "lottie" ? "json" : "webp"}`);
    await db.artAsset.delete({ where: { id } });
    forgetCatalog();
    return NextResponse.json({ ok: true });
  });
}
