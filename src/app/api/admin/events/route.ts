import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { withAdmin } from "@/lib/admin-api";

/** Clear abuse events: all, or everything from one IP fingerprint. */
export async function DELETE(req: Request) {
  return withAdmin(async () => {
    const body = z.object({ ipHash: z.string().max(40).optional() }).safeParse(await req.json().catch(() => ({})));
    if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    await db.securityEvent.deleteMany({ where: body.data.ipHash ? { ipHash: body.data.ipHash } : {} });
    return NextResponse.json({ ok: true });
  });
}
