import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, SUBSCRIPTION_PLANS, type SubscriptionPlanKey } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: SubscriptionPlanKey };
  const planConfig = SUBSCRIPTION_PLANS[plan];
  if (!planConfig) {
    return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
  }
  if (!planConfig.priceId) {
    return NextResponse.json(
      {
        error: `Le paiement en ligne n'est pas encore configuré pour le plan ${plan}. Contactez l'administrateur.`,
      },
      { status: 503 }
    );
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  // Récupère ou crée le client Stripe correspondant à cet utilisateur
  let customerId = user.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${origin}/premium?success=1`,
    cancel_url: `${origin}/premium?canceled=1`,
    metadata: { userId: user.id, plan },
    subscription_data: { metadata: { userId: user.id, plan } },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
