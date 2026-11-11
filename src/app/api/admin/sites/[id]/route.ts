import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { withAdmin } from "@/lib/admin-api";

const patch = z.object({ published: z.boolean().optional(), premium: z.boolean().optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = patch.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const { data: site } = await supabase.from("Site").update(body.data).eq("id", id).select().maybeSingle();
    if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    await supabase.from("Site").delete().eq("id", id);
    return NextResponse.json({ ok: true });
  });
}
