import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { parseCustomization } from "@/lib/content";
import { deleteStored } from "@/lib/storage";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const { data: photo } = await supabase
    .from("Photo")
    .select("*, site:Site(*)")
    .eq("id", id)
    .maybeSingle();

  const site = photo?.site as { id: string; userId: string; customization: string } | undefined;
  if (!photo || !site || site.userId !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await supabase.from("Photo").delete().eq("id", photo.id);
  // If this photo was the cover, clear it.
  const cz = parseCustomization(site.customization);
  if (cz.coverUrl === photo.url) {
    delete cz.coverUrl;
    await supabase.from("Site").update({ customization: JSON.stringify(cz) }).eq("id", site.id);
  }
  await deleteStored(photo.storageKey);
  return NextResponse.json({ ok: true });
}
