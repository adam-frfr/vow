import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";
import { ipHashOf } from "@/lib/security";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });

    const email = parsed.data.email;
    const { data: user, error } = await supabase
      .from("User")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("[supabase login error]", error);
      return NextResponse.json({ error: "Failed to connect to database. Check Supabase connection." }, { status: 500 });
    }

    const ok = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
    const event = { email, ipHash: ipHashOf(req), userAgent: (req.headers.get("user-agent") ?? "").slice(0, 200) };

    if (!user || !ok) {
      if (user?.id) {
        await supabase.from("LoginEvent").insert({ ...event, userId: user.id, ok: false });
      }
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (user.blocked) {
      await supabase.from("LoginEvent").insert({ ...event, userId: user.id, ok: false });
      return NextResponse.json({ error: "This account has been suspended." }, { status: 403 });
    }

    await supabase.from("LoginEvent").insert({ ...event, userId: user.id, ok: true });
    await supabase.from("User").update({ lastLoginAt: new Date().toISOString() }).eq("id", user.id);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, await signSession(user.id), sessionCookieOptions);
    return res;
  } catch (err: unknown) {
    console.error("[login exception]", err);
    return NextResponse.json({ error: "An unexpected error occurred during login." }, { status: 500 });
  }
}
