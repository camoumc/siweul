import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Middleware 100% Edge-compatible : ne charge jamais Prisma/bcrypt,
// contrairement à src/auth.ts qui contient les providers complets.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/admin/:path*", "/tableau-de-bord/:path*", "/entreprise/:path*"],
};
