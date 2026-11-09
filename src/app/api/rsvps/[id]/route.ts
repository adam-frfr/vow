import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { db } from "@/lib/db";

/** Couple removes an RSVP (duplicates, test entries). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const rsvp = await db.rsvp.findFirst({ where: { id, site: { userId } } });
  if (!rsvp) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.rsvp.delete({ where: { id: rsvp.id } });
  return NextResponse.json({ ok: true });
}
