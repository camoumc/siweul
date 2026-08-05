import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.paymentProviderConfig.findMany({
    where: { enabled: true },
    select: { provider: true },
  });
  const enabledProviders = rows.map((r) => r.provider);

  // Stripe reste piloté par variables d'environnement (recommandation de
  // sécurité standard pour les clés Stripe), pas par la base de données.
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PREMIUM) {
    enabledProviders.push("STRIPE");
  }

  return NextResponse.json({ enabledProviders });
}
