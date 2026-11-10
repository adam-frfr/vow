import { NextResponse } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/admin-api";
import { b2, forgetStorageConfig, listLocalAssets, putObject, readLocalAsset, TYPE_BY_EXT } from "@/lib/storage";

export const maxDuration = 60;
const BATCH = 30;

/**
 * Copies the built-in art library to Backblaze, a batch per call (the admin
 * page keeps calling with the next offset and shows progress).
 */
export async function POST(req: Request) {
  return withAdmin(async () => {
    const body = z.object({ offset: z.number().int().min(0) }).safeParse(await req.json().catch(() => ({})));
    if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    forgetStorageConfig();
    if (!(await b2())) return NextResponse.json({ error: "Save working Backblaze keys first." }, { status: 400 });
    const files = await listLocalAssets();
    const slice = files.slice(body.data.offset, body.data.offset + BATCH);
    try {
      // Six uploads at a time: fast, without flooding the connection.
      for (let i = 0; i < slice.length; i += 6) {
        await Promise.all(
          slice.slice(i, i + 6).map(async (rel) => putObject(`assets/${rel}`, TYPE_BY_EXT[rel.split(".").pop() ?? ""] ?? "application/octet-stream", await readLocalAsset(rel))),
        );
      }
    } catch (e) {
      const err = e as Error & { cause?: { code?: string; message?: string } };
      const why = err.cause?.code ?? err.cause?.message;
      return NextResponse.json({ error: `${err.message}${why ? ` (${why})` : ""}. Press the button again to continue from here.`, next: body.data.offset }, { status: 502 });
    }
    const next = body.data.offset + slice.length;
    return NextResponse.json({ total: files.length, next, done: next >= files.length });
  });
}
