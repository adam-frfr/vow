import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Called once a day by Vercel Cron (see vercel.json). A free Supabase project
 * pauses after 7 days without database requests; this keeps it awake.
 */
export async function GET() {
  const users = await db.user.count();
  return NextResponse.json({ ok: true, at: new Date().toISOString(), users });
}
