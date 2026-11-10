import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/admin-api";
import { forgetCatalog } from "@/lib/catalog";
import { db } from "@/lib/db";

/** Creates a library section (shown as a tab in every couple's art library). */
export async function POST(req: Request) {
  return withAdmin(async () => {
    const body = z.object({ name: z.string().trim().min(2, "Give the section a name.").max(40) }).safeParse(await req.json().catch(() => null));
    if (!body.success) return NextResponse.json({ error: body.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    const slug = body.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "section";
    const id = `s-${slug}-${randomBytes(2).toString("hex")}`;
    const last = await db.librarySection.aggregate({ _max: { position: true } });
    await db.librarySection.create({ data: { id, name: body.data.name, position: (last._max.position ?? 0) + 1 } });
    forgetCatalog();
    return NextResponse.json({ id });
  });
}
