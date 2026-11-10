import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-api";

const patch = z.object({ hidden: z.boolean() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = patch.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    // Restoring a message also clears the spam flag.
    await db.wish.update({ where: { id }, data: { hidden: body.data.hidden, ...(body.data.hidden ? {} : { flagged: false }) } }).catch(() => null);
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    await db.wish.delete({ where: { id } }).catch(() => null);
    return NextResponse.json({ ok: true });
  });
}
