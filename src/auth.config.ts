import type { NextAuthConfig } from "next-auth";

// Configuration compatible Edge Runtime : AUCUNE dépendance à Prisma/bcrypt ici.
// Le middleware ne fait que lire le token JWT pour protéger les routes ;
// l'authentification réelle (Credentials + Prisma) vit dans src/auth.ts,
// qui n'est chargé que côté Node.js (routes API, Server Components).
export const authConfig = {
  // NextAuth v5 lit AUTH_SECRET par défaut ; on accepte aussi NEXTAUTH_SECRET
  // (nom historique v4) pour éviter l'erreur "Server error - problem with the
  // server configuration" si une seule des deux variables est définie sur Vercel.
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  // Nécessaire pour accepter les requêtes venant d'un domaine personnalisé
  // (ex. www.siweul.pro) plutôt que uniquement *.vercel.app
  trustHost: true,
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
