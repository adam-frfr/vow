import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";
import { guard, ipHashOf } from "@/lib/security";
import { getBool } from "@/lib/settings";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export async function POST(req: Request) {
  if (!(await guard(req, "signup", 10, 60_000))) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }
  if (!(await getBool("site.signupsOpen"))) {
    return NextResponse.json({ error: "New sign-ups are paused right now. Please try again later." }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid details" }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }
  const user = await db.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 12), lastLoginAt: new Date() } });
  await db.loginEvent.create({ data: { userId: user.id, email, ok: true, ipHash: ipHashOf(req), userAgent: (req.headers.get("user-agent") ?? "").slice(0, 200) } });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await signSession(user.id), sessionCookieOptions);
  return res;
}
