import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

/** Couple removes an RSVP (duplicates, test entries). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const { data: rsvp } = await supabase
    .from("Rsvp")
    .select("id, site:Site(userId)")
    .eq("id", id)
    .maybeSingle();

  const siteOwner = (rsvp?.site as { userId?: string })?.userId;
  if (!rsvp || siteOwner !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await supabase.from("Rsvp").delete().eq("id", rsvp.id);
  return NextResponse.json({ ok: true });
}
