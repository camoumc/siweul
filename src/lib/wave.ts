import crypto from "crypto";
import { getProviderConfig, type WaveKeys } from "@/lib/paymentProviders";

const WAVE_BASE_URL = "https://api.wave.com";

export async function createWaveCheckoutSession(params: {
  amount: number; // FCFA, entier (XOF n'a pas de centimes)
  successUrl: string;
  errorUrl: string;
  clientReference: string;
}) {
  const { enabled, keys } = await getProviderConfig<WaveKeys>("WAVE");
  if (!enabled || !keys?.apiKey) {
    throw new Error("Wave n'est pas configuré ou est désactivé.");
  }

  const res = await fetch(`${WAVE_BASE_URL}/v1/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${keys.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: String(params.amount),
      currency: "XOF",
      success_url: params.successUrl,
      error_url: params.errorUrl,
      client_reference: params.clientReference,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur Wave (${res.status}): ${text}`);
  }

  return res.json() as Promise<{
    id: string;
    wave_launch_url: string;
    amount: string;
    currency: string;
    checkout_status: string;
  }>;
}

/**
 * Vérifie la signature d'un webhook Wave.
 * En-tête attendu : "Wave-Signature: t={timestamp},v1={signature}"
 * Signature = HMAC-SHA256({timestamp}{corps brut de la requête}) avec le
 * secret de signature (Business Portal > Developer).
 */
export function verifyWaveSignature(
  rawBody: string,
  signatureHeader: string,
  signingSecret: string
): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("=") as [string, string])
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const expected = crypto
    .createHmac("sha256", signingSecret)
    .update(timestamp + rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
