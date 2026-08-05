import { getProviderConfig, type OrangeMoneyKeys } from "@/lib/paymentProviders";

/**
 * NOTE IMPORTANTE : l'API Orange Money varie légèrement selon le pays et le
 * contrat marchand (endpoints, format exact de la devise "OUV" vs code ISO,
 * mécanisme précis de notif_url). Cette implémentation suit le schéma
 * standard documenté par Orange Developer (developer.orange.com) et utilisé
 * par les intégrations communautaires les plus courantes. Vérifiez les
 * détails exacts (URL, pays) dans votre Espace Développeur Orange lors du
 * premier test — ajustez `country` si besoin.
 */

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://api.orange.com/oauth/v3/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`Impossible d'obtenir un token Orange Money (${res.status}).`);
  }
  const data = await res.json();
  return data.access_token as string;
}

export async function createOrangeMoneyPayment(params: {
  amount: number;
  orderId: string;
  returnUrl: string;
  cancelUrl: string;
  notifUrl: string;
  reference: string;
}) {
  const { enabled, keys } = await getProviderConfig<OrangeMoneyKeys>("ORANGE_MONEY");
  if (!enabled || !keys?.clientId || !keys?.clientSecret || !keys?.merchantKey) {
    throw new Error("Orange Money n'est pas configuré ou est désactivé.");
  }

  const token = await getAccessToken(keys.clientId, keys.clientSecret);
  const country = keys.country || "sn";

  const res = await fetch(`https://api.orange.com/orange-money-webpay/${country}/v1/webpayment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      merchant_key: keys.merchantKey,
      currency: "OUV",
      order_id: params.orderId,
      amount: params.amount,
      return_url: params.returnUrl,
      cancel_url: params.cancelUrl,
      notif_url: params.notifUrl,
      lang: "fr",
      reference: params.reference,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur Orange Money (${res.status}): ${text}`);
  }

  return res.json() as Promise<{
    payment_url: string;
    pay_token: string;
    notif_token: string;
  }>;
}
