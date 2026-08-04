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
import "dotenv/config";
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

  await seedPricing();
}

async function seedPricing() {
  const DEFAULT_RULES: { key: string; label: string; category: string; amount: number }[] = [
    // Documents administratifs
    { key: "CNI", label: "Carte nationale d'identité", category: "Document administratif", amount: 1000 },
    { key: "PASSEPORT", label: "Passeport", category: "Document administratif", amount: 2000 },
    { key: "PERMIS", label: "Permis de conduire", category: "Document administratif", amount: 1500 },
    { key: "CARTE_BANCAIRE", label: "Carte bancaire", category: "Document administratif", amount: 1000 },
    // Objets
    { key: "TELEPHONE", label: "Téléphone", category: "Objet", amount: 2000 },
    { key: "ORDINATEUR", label: "Ordinateur", category: "Objet", amount: 5000 },
    { key: "SAC", label: "Sac", category: "Objet", amount: 3000 },
    // Véhicules
    { key: "MOTO", label: "Moto", category: "Véhicule", amount: 5000 },
    { key: "VOITURE", label: "Voiture", category: "Véhicule", amount: 10000 },
  ];

  for (const rule of DEFAULT_RULES) {
    await prisma.pricingRule.upsert({
      where: { key: rule.key },
      update: {},
      create: rule,
    });
  }
  console.log(`✅ Grille tarifaire initialisée (${DEFAULT_RULES.length} tarifs).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
