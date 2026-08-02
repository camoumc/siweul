import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Requis depuis Prisma ORM 7 : la CLI (db push, migrate, studio, seed) lit
// l'URL de connexion ici plutôt que dans prisma/schema.prisma.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
  },
});
