import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { db } from "@/lib/db";

async function ownedWish(id: string) {
  const userId = await getUserId();
  if (!userId) return null;
  return db.wish.findFirst({ where: { id, site: { userId } } });
}

/** Couple hides or un-hides a guestbook entry. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wish = await ownedWish(id);
  if (!wish) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = z.object({ hidden: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await db.wish.update({ where: { id: wish.id }, data: { hidden: body.data.hidden } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wish = await ownedWish(id);
  if (!wish) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.wish.delete({ where: { id: wish.id } });
  return NextResponse.json({ ok: true });
}
