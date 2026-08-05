import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createOrangeMoneyPayment } from "@/lib/orangeMoney";
import { getSubscriptionAmount } from "@/lib/planPricing";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: "PREMIUM" | "PRO" };
  if (!["PREMIUM", "PRO"].includes(plan)) {
    return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
  }

  const amount = await getSubscriptionAmount(plan);
  if (!amount) {
    return NextResponse.json(
      { error: "Tarif non configuré pour ce plan (voir Admin > Grille tarifaire)." },
      { status: 503 }
    );
  }

  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const orderId = `${session.user.id}:${plan}:${Date.now()}`;

  try {
    const payment = await createOrangeMoneyPayment({
      amount,
      orderId,
      returnUrl: `${origin}/premium?success=1&provider=orange_money`,
      cancelUrl: `${origin}/premium?canceled=1`,
      notifUrl: `${origin}/api/webhooks/orange-money`,
      reference: `SIWEUL ${plan}`,
    });
    return NextResponse.json({ url: payment.payment_url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}
