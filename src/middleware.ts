import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // L'autorisation est gérée dans auth.config.ts
  // via le callback `authorized`.
});

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