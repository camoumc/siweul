import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const secret =
    process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (!secret) {
    console.error("AUTH_SECRET / NEXTAUTH_SECRET est manquant.");
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  const token = await decode({
    token:
      request.cookies.get("__Secure-authjs.session-token")?.value ??
      request.cookies.get("authjs.session-token")?.value,
    secret,
    salt: "authjs.session-token",
  });

  const isLoggedIn = !!token;

  const path = request.nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");

  const isDashboardRoute =
    path.startsWith("/tableau-de-bord") ||
    path.startsWith("/entreprise") ||
    path.startsWith("/ambassadeur") ||
    path.startsWith("/parametres") ||
    path.startsWith("/notifications");

  // Routes administrateur
  if (isAdminRoute) {
    const role = token?.role as string | undefined;

    if (
      !isLoggedIn ||
      !["ADMIN", "SUPER_ADMIN"].includes(role ?? "")
    ) {
      return NextResponse.redirect(
        new URL("/connexion", request.url)
      );
    }
  }

  // Routes utilisateur connectées
  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(
      new URL("/connexion", request.url)
    );
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