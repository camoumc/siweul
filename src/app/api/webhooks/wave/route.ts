import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWaveSignature } from "@/lib/wave";
import { getProviderConfig, type WaveKeys } from "@/lib/paymentProviders";
import { awardBadge } from "@/lib/points";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signatureHeader = req.headers.get("wave-signature");

  const { keys } = await getProviderConfig<WaveKeys>("WAVE");
  if (!keys?.webhookSecret) {
    return NextResponse.json({ error: "Webhook Wave non configuré." }, { status: 400 });
  }
  if (!signatureHeader || !verifyWaveSignature(rawBody, signatureHeader, keys.webhookSecret)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.type === "checkout.session.completed" && event.data?.payment_status === "succeeded") {
    const clientReference = event.data.client_reference as string | null;
    if (clientReference) {
      const [userId, plan] = clientReference.split(":");
      if (userId && (plan === "PREMIUM" || plan === "PRO")) {
        await prisma.user.update({ where: { id: userId }, data: { plan } });
        await prisma.payment.create({
          data: {
            userId,
            provider: "wave",
            providerRef: event.data.id,
            amount: Number(event.data.amount) || 0,
            currency: event.data.currency ?? "XOF",
            plan,
            status: "PAYE",
          },
        });
        await prisma.notification.create({
          data: {
            userId,
            type: "SYSTEME",
            title: `Bienvenue dans SIWEUL ${plan} !`,
            body: "Votre paiement Wave a été confirmé. Merci de votre confiance.",
            link: "/tableau-de-bord",
          },
        });
        await awardBadge(userId, "VERIFIE");
      }
    }
  }

  return NextResponse.json({ received: true });
}
