import { NextResponse } from "next/server";
import { setupProblems } from "@/lib/health";

export const dynamic = "force-dynamic";

/** Open /api/health after deploying: it lists anything misconfigured (no secrets shown). */
export async function GET() {
  const problems = await setupProblems();
  return NextResponse.json({ ok: problems.length === 0, problems }, { status: problems.length ? 503 : 200, headers: { "Cache-Control": "no-store" } });
}
