import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { saveProviderConfig, resetProviderConfig, maskKey, type ProviderName } from "@/lib/paymentProviders";
import { decrypt } from "@/lib/crypto";

const PROVIDERS: ProviderName[] = ["WAVE", "ORANGE_MONEY"];

// Renvoie l'état de chaque provider avec les clés MASQUÉES (jamais en clair).
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  try {
    const rows = await prisma.paymentProviderConfig.findMany({
      where: { provider: { in: PROVIDERS } },
    });

    const result = PROVIDERS.map((provider) => {
      const row = rows.find((r) => r.provider === provider);
      let maskedKeys: Record<string, string> = {};
      if (row?.encryptedKeys) {
        try {
          const keys = JSON.parse(decrypt(row.encryptedKeys)) as Record<string, string>;
          maskedKeys = Object.fromEntries(
            Object.entries(keys).map(([k, v]) => [k, v ? maskKey(v) : ""])
          );
        } catch {
          maskedKeys = {};
        }
      }
      return {
        provider,
        enabled: row?.enabled ?? false,
        configured: !!row?.encryptedKeys,
        maskedKeys,
        updatedAt: row?.updatedAt ?? null,
      };
    });

    const stripeConfigured = !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PREMIUM);
    result.push({
      provider: "STRIPE",
      enabled: stripeConfigured,
      configured: stripeConfigured,
      maskedKeys: {},
      updatedAt: null,
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("Erreur /api/admin/payment-providers:", e);
    return NextResponse.json(
      {
        error:
          "Impossible de lire la configuration des paiements. La table PaymentProviderConfig existe-t-elle en base ? Lancez `npx prisma db push` puis réessayez.",
        detail: (e as Error).message,
      },
      { status: 500 }
    );
  }
}

// Met à jour les clés/statut d'un provider. On n'écrase une clé que si une
// nouvelle valeur non vide est envoyée (pour permettre de juste toggler
// enabled/disabled sans ressaisir toutes les clés). `reset: true` efface
// entièrement les clés et désactive le provider.
export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { provider, enabled, keys, reset } = await req.json();
  if (!PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "Provider invalide." }, { status: 400 });
  }

  try {
    if (reset) {
      const updated = await resetProviderConfig(provider);
      return NextResponse.json({ ok: true, updatedAt: updated.updatedAt });
    }

    const existing = await prisma.paymentProviderConfig.findUnique({ where: { provider } });
    let mergedKeys: Record<string, string> = {};
    if (existing?.encryptedKeys) {
      try {
        mergedKeys = JSON.parse(decrypt(existing.encryptedKeys));
      } catch {
        mergedKeys = {};
      }
    }
    if (keys && typeof keys === "object") {
      for (const [k, v] of Object.entries(keys)) {
        if (typeof v === "string" && v.trim().length > 0) mergedKeys[k] = v.trim();
      }
    }

    const updated = await saveProviderConfig(provider, mergedKeys, enabled ?? existing?.enabled ?? false);
    return NextResponse.json({ ok: true, updatedAt: updated.updatedAt });
  } catch (e) {
    console.error("Erreur PATCH /api/admin/payment-providers:", e);
    return NextResponse.json(
      {
        error:
          "Échec de l'enregistrement. Vérifiez que ENCRYPTION_KEY est configuré et que `npx prisma db push` a bien été exécuté.",
        detail: (e as Error).message,
      },
      { status: 500 }
    );
  }
}
