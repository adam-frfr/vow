import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Called once a day by Vercel Cron (see vercel.json). A free Supabase project
 * pauses after 7 days without database requests; this keeps it awake.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  await supabase.from("User").select("id", { count: "exact", head: true });
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
