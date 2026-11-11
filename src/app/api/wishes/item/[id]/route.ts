import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

async function ownedWish(id: string) {
  const userId = await getUserId();
  if (!userId) return null;
  const { data: wish } = await supabase
    .from("Wish")
    .select("id, site:Site(userId)")
    .eq("id", id)
    .maybeSingle();

  const siteOwner = (wish?.site as { userId?: string })?.userId;
  if (!wish || siteOwner !== userId) return null;
  return wish;
}

/** Couple hides or un-hides a guestbook entry. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wish = await ownedWish(id);
  if (!wish) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = z.object({ hidden: z.boolean() }).safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await supabase
    .from("Wish")
    .update({ hidden: body.data.hidden, ...(body.data.hidden ? {} : { flagged: false }) })
    .eq("id", wish.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wish = await ownedWish(id);
  if (!wish) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await supabase.from("Wish").delete().eq("id", wish.id);
  return NextResponse.json({ ok: true });
}
