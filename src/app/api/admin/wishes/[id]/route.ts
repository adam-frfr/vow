import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { withAdmin } from "@/lib/admin-api";

const patch = z.object({ hidden: z.boolean() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = patch.safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    // Restoring a message also clears the spam flag.
    await supabase.from("Wish").update({ hidden: body.data.hidden, ...(body.data.hidden ? {} : { flagged: false }) }).eq("id", id);
    return NextResponse.json({ ok: true });
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withAdmin(async () => {
    const { id } = await params;
    await supabase.from("Wish").delete().eq("id", id);
    return NextResponse.json({ ok: true });
  });
}
