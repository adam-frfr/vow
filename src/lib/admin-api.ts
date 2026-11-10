import "server-only";
import { NextResponse } from "next/server";
import { adminOrNull } from "./auth";

/** Wrap an admin API handler: 404 for non-admins (the panel is not advertised). */
export async function withAdmin<T>(fn: (admin: NonNullable<Awaited<ReturnType<typeof adminOrNull>>>) => Promise<T>) {
  const admin = await adminOrNull();
  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return fn(admin);
}
