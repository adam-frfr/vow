import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "./db";
import { supabase } from "./supabase";
import { SESSION_COOKIE, verifySession } from "./session";

/** Emails listed in ADMIN_EMAILS (comma-separated) are always admins. */
export function isAdminEmail(email: string) {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

async function sessionUser() {
  const store = await cookies();
  const id = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!id) return null;
  const { data: u } = await supabase.from("User").select("id, email, name, isAdmin, blocked").eq("id", id).maybeSingle();
  if (!u || u.blocked) return null;
  return { ...u, isAdmin: u.isAdmin || isAdminEmail(u.email) };
}

export async function getUserId() {
  return (await sessionUser())?.id ?? null;
}

export async function getUser() {
  return sessionUser();
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** Admin pages 404 for everyone else (so the panel's existence isn't advertised). */
export async function requireAdmin() {
  const user = await getUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) notFound();
  return user;
}

/** For admin API routes: the admin user, or null. */
export async function adminOrNull() {
  const user = await getUser();
  return user?.isAdmin ? user : null;
}

/** Returns the site only if it belongs to the signed-in user. */
export async function getOwnedSite(siteId: string) {
  const userId = await getUserId();
  if (!userId) return null;
  return db.site.findFirst({ where: { id: siteId, userId } });
}
