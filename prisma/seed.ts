/**
 * Crée (ou met à jour) le premier compte Super Administrateur de SIWEUL.
 *
 * Utilisation :
 *   ADMIN_EMAIL=admin@siweul.sn ADMIN_PASSWORD=changez-moi ADMIN_NAME="Admin SIWEUL" \
 *   npx tsx prisma/seed.ts
 *
 * Ou simplement :
 *   npx tsx prisma/seed.ts
 * (des valeurs par défaut seront utilisées — à changer immédiatement après connexion)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@siweul.sn";
  const password = process.env.ADMIN_PASSWORD ?? "SiweulAdmin2026!";
  const name = process.env.ADMIN_NAME ?? "Administrateur SIWEUL";

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "SUPER_ADMIN", isBanned: false },
    create: {
      name,
      email,
      password: hashed,
      role: "SUPER_ADMIN",
      isVerified: true,
    },
  });

  console.log("✅ Compte Super Administrateur prêt :");
  console.log(`   Email    : ${user.email}`);
  console.log(`   Mot de passe : ${password} (changez-le après votre première connexion)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
