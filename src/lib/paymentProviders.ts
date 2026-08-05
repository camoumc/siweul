import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";

export type ProviderName = "STRIPE" | "WAVE" | "ORANGE_MONEY";

export interface WaveKeys {
  apiKey: string;
  webhookSecret?: string;
}

export interface OrangeMoneyKeys {
  clientId: string;
  clientSecret: string;
  merchantKey: string;
  country?: string; // ex: "sn" pour Sénégal
}

export async function getProviderConfig<T = Record<string, string>>(
  provider: ProviderName
): Promise<{ enabled: boolean; keys: T | null }> {
  const row = await prisma.paymentProviderConfig.findUnique({ where: { provider } });
  if (!row) return { enabled: false, keys: null };
  const keys = row.encryptedKeys ? (JSON.parse(decrypt(row.encryptedKeys)) as T) : null;
  return { enabled: row.enabled, keys };
}

export async function saveProviderConfig(
  provider: ProviderName,
  keys: Record<string, string>,
  enabled: boolean
) {
  const encryptedKeys = encrypt(JSON.stringify(keys));
  return prisma.paymentProviderConfig.upsert({
    where: { provider },
    update: { encryptedKeys, enabled },
    create: { provider, encryptedKeys, enabled },
  });
}

/** Masque une clé pour affichage admin, ex: "wave_sn_prod_••••••••i4bA6" */
export function maskKey(value: string): string {
  if (value.length <= 8) return "••••••••";
  return `${value.slice(0, 8)}${"•".repeat(8)}${value.slice(-4)}`;
}
