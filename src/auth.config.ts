import type { NextAuthConfig } from "next-auth";

// Configuration compatible Edge Runtime : AUCUNE dépendance à Prisma/bcrypt ici.
// Le middleware ne fait que lire le token JWT pour protéger les routes ;
// l'authentification réelle (Credentials + Prisma) vit dans src/auth.ts,
// qui n'est chargé que côté Node.js (routes API, Server Components).
//
// IMPORTANT : les callbacks jwt/session vivent ICI (et pas seulement dans
// auth.ts) car le middleware utilise sa propre instance NextAuth(authConfig).
// Sans ces callbacks partagés, le rôle/plan de l'utilisateur ne serait pas
// disponible dans le middleware, et un admin connecté se retrouverait
// bloqué hors de /admin malgré une session valide.
export const authConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/connexion",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.plan = (user as { plan?: string }).plan;
        token.id = (user as { id?: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.plan = token.plan as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;
      const isAdminRoute = path.startsWith("/admin");
      const isDashboardRoute =
        path.startsWith("/tableau-de-bord") ||
        path.startsWith("/entreprise") ||
        path.startsWith("/ambassadeur");

      if (isAdminRoute) {
        return isLoggedIn && ["ADMIN", "SUPER_ADMIN"].includes(auth?.user?.role ?? "");
      }
      if (isDashboardRoute) {
        return isLoggedIn;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
