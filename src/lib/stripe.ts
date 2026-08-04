import Stripe from "stripe";

// La clé n'est requise qu'au moment d'utiliser Stripe (pas au chargement du
// module) pour ne pas casser le build/les autres pages si elle n'est pas
// encore configurée.
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY n'est pas configure. Ajoutez-le dans vos variables d'environnement."
    );
  }
  return new Stripe(key);
}

// Les Price ID sont crees depuis le Dashboard Stripe (Produits > Ajouter un
// produit > Prix recurrent), ce qui vous laisse choisir la devise reellement
// supportee par votre compte Stripe (le FCFA/XOF n'est pas toujours
// disponible selon le pays d'enregistrement du compte — voir le README).
export const SUBSCRIPTION_PLANS = {
  PREMIUM: {
    label: "Premium",
    priceId: process.env.STRIPE_PRICE_PREMIUM ?? null,
  },
  PRO: {
    label: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO ?? null,
  },
} as const;

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS;
