import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardBadge } from "@/lib/points";
import { notifyUser } from "@/lib/notify";

/**
 * Orange Money notifie généralement notif_url par une requête (GET ou POST
 * selon la configuration du contrat marchand) contenant order_id et un
 * statut. On gère les deux cas pour être robuste. À ajuster si votre
 * Espace Développeur Orange documente un format différent pour votre pays.
 */
async function handleNotification(orderId: string | null, status: string | null) {
  if (!orderId) return NextResponse.json({ error: "order_id manquant." }, { status: 400 });

  const [userId, plan] = orderId.split(":");
  const isSuccess = ["SUCCESS", "SUCCESSFUL", "success"].includes(status ?? "");

  if (userId && (plan === "PREMIUM" || plan === "PRO") && isSuccess) {
    await prisma.user.update({ where: { id: userId }, data: { plan } });

    const existing = await prisma.payment.findFirst({ where: { providerRef: orderId } });
    if (!existing) {
      const amount = (await prisma.pricingRule.findUnique({ where: { key: `${plan}_MONTHLY` } }))
        ?.amount ?? 0;
      await prisma.payment.create({
        data: {
          userId,
          provider: "orange_money",
          providerRef: orderId,
          amount,
          currency: "XOF",
          plan,
          status: "PAYE",
        },
      });
      await notifyUser({
        userId,
        type: "SYSTEME",
        title: `Bienvenue dans SIWEUL ${plan} !`,
        body: "Votre paiement Orange Money a été confirmé. Merci de votre confiance.",
        link: "/tableau-de-bord",
        email: true,
      });
      await awardBadge(userId, "VERIFIE");
    }
  }

  return NextResponse.json({ received: true });
}

export async function POST(req: Request) {
  let orderId: string | null = null;
  let status: string | null = null;
  try {
    const body = await req.json();
    orderId = body.order_id ?? null;
    status = body.status ?? body.txnstatus ?? null;
  } catch {
    // corps vide ou non-JSON : on retombe sur les query params
  }
  const { searchParams } = new URL(req.url);
  orderId = orderId ?? searchParams.get("order_id");
  status = status ?? searchParams.get("status");
  return handleNotification(orderId, status);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  return handleNotification(searchParams.get("order_id"), searchParams.get("status"));
}
