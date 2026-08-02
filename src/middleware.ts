import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Middleware Edge-compatible
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/admin/:path*", "/tableau-de-bord/:path*"],
};