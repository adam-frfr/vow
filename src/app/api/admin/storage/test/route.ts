import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/admin-api";
import { testB2 } from "@/lib/storage";

/** Checks the saved Backblaze keys by writing, reading and deleting a tiny file. */
export async function POST() {
  return withAdmin(async () => {
    const r = await testB2();
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  });
}
