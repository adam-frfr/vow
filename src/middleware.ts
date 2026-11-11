import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const PRIVATE = /^\/(dashboard|admin)(\/|$)/;

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;
  const userId = sessionToken ? await verifySession(sessionToken) : null;

  if (PRIVATE.test(path) && !userId) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", path + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
