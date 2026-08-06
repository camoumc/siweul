import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { awardBadge } from "@/lib/points";
import { notifyUser } from "@/lib/notify";
import type Stripe from "stripe";

// Next.js doit recevoir le corps brut (non parsé) pour que Stripe puisse
// vérifier la signature du webhook.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 400 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Signature Stripe invalide:", err);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const cs = event.data.object as Stripe.Checkout.Session;
      const userId = cs.metadata?.userId;
      const plan = cs.metadata?.plan as "PREMIUM" | "PRO" | undefined;
      if (userId && plan) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeSubscriptionId:
              typeof cs.subscription === "string" ? cs.subscription : cs.subscription?.id,
          },
        });
        await prisma.payment.create({
          data: {
            userId,
            provider: "stripe",
            providerRef: cs.id,
            amount: cs.amount_total ?? 0,
            currency: cs.currency ?? "xof",
            plan,
            status: "PAYE",
          },
        });
        await notifyUser({
          userId,
          type: "SYSTEME",
          title: `Bienvenue dans SIWEUL ${plan} !`,
          body: "Votre abonnement est actif. Merci de votre confiance.",
          link: "/tableau-de-bord",
          email: true,
        });
        await awardBadge(userId, "VERIFIE");
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: "GRATUIT", stripeSubscriptionId: null },
        });
        await notifyUser({
          userId,
          type: "SYSTEME",
          title: "Abonnement terminé",
          body: "Votre abonnement SIWEUL a pris fin. Vous êtes repassé au plan Gratuit.",
          link: "/premium",
          email: true,
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
