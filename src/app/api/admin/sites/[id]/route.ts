import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-api";

const patch = z.object({ published: z.boolean().optional(), premium: z.boolean().optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = patch.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const site = await db.site.update({ where: { id }, data: body.data }).catch(() => null);
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    await db.site.delete({ where: { id } }).catch(() => null);
    return NextResponse.json({ ok: true });
  });
}
