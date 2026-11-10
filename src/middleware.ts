import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { db } from "@/lib/db";
import { getBool } from "@/lib/settings";

/** Paths that stay open during maintenance (sign-in for admins, the admin panel, APIs, art). */
const OPEN = /^\/(login|admin|maintenance|api|library|florals|fx|cutouts|_next)(\/|$)/;
const PRIVATE = /^\/(dashboard|admin)(\/|$)/;

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const userId = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (!OPEN.test(path) && (await getBool("site.maintenance").catch(() => false))) {
    const admin = userId ? await db.user.findUnique({ where: { id: userId }, select: { isAdmin: true } }).catch(() => null) : null;
    if (!admin?.isAdmin) return NextResponse.rewrite(new URL("/maintenance", req.url), { status: 503 });
  }

  if (PRIVATE.test(path) && !userId) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", path + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Node.js runtime so the maintenance switch can be read from the database.
  runtime: "nodejs",
  matcher: ["/((?!_next/static|_next/image|favicon.ico|library/|florals/|fx/|cutouts/|api/).*)"],
};
