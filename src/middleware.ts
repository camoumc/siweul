import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await decode({
    token: request.cookies.get("authjs.session-token")?.value,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET!,
  });

  const path = request.nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");

  const isDashboardRoute =
    path.startsWith("/tableau-de-bord") ||
    path.startsWith("/entreprise") ||
    path.startsWith("/ambassadeur") ||
    path.startsWith("/parametres") ||
    path.startsWith("/notifications");

  if (isAdminRoute) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/connexion";
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }

    const role = token.role as string | undefined;

    if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isDashboardRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/tableau-de-bord/:path*",
    "/entreprise/:path*",
    "/ambassadeur/:path*",
    "/parametres/:path*",
    "/notifications/:path*",
  ],
};