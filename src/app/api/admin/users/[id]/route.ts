import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { withAdmin } from "@/lib/admin-api";

const patch = z.object({ blocked: z.boolean().optional(), isAdmin: z.boolean().optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async (admin) => {
    const { id } = await params;
    const body = patch.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    if (id === admin.id && (body.data.blocked || body.data.isAdmin === false)) {
      return NextResponse.json({ error: "You can't block yourself or remove your own admin access." }, { status: 400 });
    }
    const { data: user } = await supabase.from("User").update(body.data).eq("id", id).select().maybeSingle();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async (admin) => {
    const { id } = await params;
    if (id === admin.id) return NextResponse.json({ error: "You can't delete your own account here." }, { status: 400 });
    await supabase.from("User").delete().eq("id", id);
    return NextResponse.json({ ok: true });
  });
}
