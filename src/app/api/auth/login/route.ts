import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";
import { guard, ipHashOf, logSecurity } from "@/lib/security";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

// Constant hash so unknown emails take as long as wrong passwords.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

export async function POST(req: Request) {
  if (!(await guard(req, "login", 10, 60_000))) {
    return NextResponse.json({ error: "Too many attempts. Please wait a minute." }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const ok = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  const event = { email: parsed.data.email, ipHash: ipHashOf(req), userAgent: (req.headers.get("user-agent") ?? "").slice(0, 200) };

  if (!user || !ok) {
    await db.loginEvent.create({ data: { ...event, userId: user?.id, ok: false } });
    await logSecurity(req, "failed_login", "login", { detail: parsed.data.email });
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  if (user.blocked) {
    await db.loginEvent.create({ data: { ...event, userId: user.id, ok: false } });
    await logSecurity(req, "blocked_login", "login", { detail: parsed.data.email });
    return NextResponse.json({ error: "This account has been suspended. Contact support if you think this is a mistake." }, { status: 403 });
  }

  await db.loginEvent.create({ data: { ...event, userId: user.id, ok: true } });
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await signSession(user.id), sessionCookieOptions);
  return res;
}
