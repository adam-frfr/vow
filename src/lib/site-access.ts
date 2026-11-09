import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Password-protected sites: after a guest enters the right password we set a
 * signed, httpOnly cookie scoped to that site. The owner always has access.
 */
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days
export const accessCookie = (siteId: string) => `vow_site_${siteId}`;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set");
  return new TextEncoder().encode(s);
}

export async function signSiteAccess(siteId: string) {
  return new SignJWT({ site: siteId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export const accessCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};

export async function hasSiteAccess(site: { id: string; userId: string; passwordHash: string | null }, userId: string | null) {
  if (!site.passwordHash) return true;
  if (userId && userId === site.userId) return true;
  const token = (await cookies()).get(accessCookie(site.id))?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.site === site.id;
  } catch {
    return false;
  }
}
