import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicPaths = [
    "/login",
    "/register",
    "/invite",
    "/team/join",
    "/design-system",
    "/studio",
    "/privacy",
    "/terms",
    "/data-deletion",
    "/api/auth",
    "/api/cron",
    "/api/team/invites/accept",
  ];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (isPublic) return NextResponse.next();

  const hasSession = req.cookies.getAll().some(
    (c) => c.name.includes("session-token") || c.name.includes("session")
  );

  if (!hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
