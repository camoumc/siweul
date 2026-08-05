import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createWaveCheckoutSession } from "@/lib/wave";
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
  // On encode userId + plan dans la référence pour les retrouver au webhook
  // (Wave ne propose pas de champ "metadata" structuré comme Stripe).
  const clientReference = `${session.user.id}:${plan}:${Date.now()}`;

  try {
    const checkout = await createWaveCheckoutSession({
      amount,
      successUrl: `${origin}/premium?success=1&provider=wave`,
      errorUrl: `${origin}/premium?canceled=1`,
      clientReference,
    });
    return NextResponse.json({ url: checkout.wave_launch_url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}
