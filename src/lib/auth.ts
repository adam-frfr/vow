import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE, verifySession } from "./session";

export async function getUserId() {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export async function getUser() {
  const id = await getUserId();
  if (!id) return null;
  return db.user.findUnique({ where: { id }, select: { id: true, email: true, name: true } });
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/** Returns the site only if it belongs to the signed-in user. */
export async function getOwnedSite(siteId: string) {
  const userId = await getUserId();
  if (!userId) return null;
  return db.site.findFirst({ where: { id: siteId, userId } });
}
