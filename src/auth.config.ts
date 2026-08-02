import type { NextAuthConfig } from "next-auth";

// Configuration compatible Edge Runtime : AUCUNE dépendance à Prisma/bcrypt ici.
// Le middleware ne fait que lire le token JWT pour protéger les routes ;
// l'authentification réelle (Credentials + Prisma) vit dans src/auth.ts,
// qui n'est chargé que côté Node.js (routes API, Server Components).
export const authConfig = {
  pages: {
    signIn: "/connexion",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;
      const isAdminRoute = path.startsWith("/admin");
      const isDashboardRoute = path.startsWith("/tableau-de-bord");

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
