import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";
import { ipHashOf } from "@/lib/security";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid details" }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    // Check if user already exists
    const { data: existing } = await supabase.from("User").select("id").eq("email", email).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const { count } = await supabase.from("User").select("*", { count: "exact", head: true });
    const first = (count ?? 0) === 0;

    const id = "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
    const passwordHash = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from("User")
      .insert({ id, name, email, passwordHash, isAdmin: first })
      .select()
      .single();

    if (error || !user) {
      console.error("[supabase signup error]", error);
      return NextResponse.json({ error: "Could not create account. Please try again." }, { status: 500 });
    }

    await supabase.from("LoginEvent").insert({
      userId: user.id,
      email,
      ok: true,
      ipHash: ipHashOf(req),
      userAgent: (req.headers.get("user-agent") ?? "").slice(0, 200),
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, await signSession(user.id), sessionCookieOptions);
    return res;
  } catch (err: unknown) {
    console.error("[signup exception]", err);
    return NextResponse.json({ error: "An unexpected error occurred during signup." }, { status: 500 });
  }
}
