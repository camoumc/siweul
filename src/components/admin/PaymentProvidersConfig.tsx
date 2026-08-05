"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, ShieldCheck } from "lucide-react";

interface ProviderStatus {
  provider: string;
  enabled: boolean;
  configured: boolean;
  maskedKeys: Record<string, string>;
  updatedAt: string | null;
}

interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
}

const PROVIDER_FIELDS: Record<string, FieldDef[]> = {
  WAVE: [
    { key: "apiKey", label: "Clé API Wave", placeholder: "wave_sn_prod_..." },
    { key: "webhookSecret", label: "Secret de signature du webhook", placeholder: "wave_sn_AKS_..." },
  ],
  ORANGE_MONEY: [
    { key: "clientId", label: "Client ID (Orange Developer)" },
    { key: "clientSecret", label: "Client Secret" },
    { key: "merchantKey", label: "Merchant Key" },
    { key: "country", label: "Code pays (ex: sn)", placeholder: "sn" },
  ],
};

const PROVIDER_LABELS: Record<string, string> = {
  WAVE: "Wave",
  ORANGE_MONEY: "Orange Money",
};

export default function PaymentProvidersConfig() {
  const [statuses, setStatuses] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({});
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [message, setMessage] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/payment-providers");
      if (res.ok) setStatuses(await res.json());
      setLoading(false);
    };
    load();
  }, []);

  const setDraftField = (provider: string, key: string, value: string) => {
    setDrafts((d) => ({ ...d, [provider]: { ...d[provider], [key]: value } }));
  };

  const save = async (provider: string, enabled: boolean) => {
    setSavingProvider(provider);
    setMessage((m) => ({ ...m, [provider]: "" }));
    const res = await fetch("/api/admin/payment-providers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, enabled, keys: drafts[provider] ?? {} }),
    });
    setSavingProvider(null);
    if (res.ok) {
      setMessage((m) => ({ ...m, [provider]: "Enregistré ✓" }));
      setDrafts((d) => ({ ...d, [provider]: {} }));
      const refreshed = await fetch("/api/admin/payment-providers");
      if (refreshed.ok) setStatuses(await refreshed.json());
    } else {
      setMessage((m) => ({ ...m, [provider]: "Erreur lors de l'enregistrement." }));
    }
  };

  if (loading) return <p className="text-sm text-text-muted">Chargement...</p>;

  return (
    <div className="space-y-6">
      {statuses.map((s) => (
        <div key={s.provider} className="rounded-3xl border border-border bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-semibold text-text">
                {PROVIDER_LABELS[s.provider]}
              </h3>
              {s.configured && (
                <span className="flex items-center gap-1 rounded-full bg-found/10 px-2 py-0.5 text-xs font-semibold text-found">
                  <ShieldCheck size={11} /> Clés enregistrées
                </span>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={s.enabled}
                onChange={(e) =>
                  setStatuses((prev) =>
                    prev.map((p) => (p.provider === s.provider ? { ...p, enabled: e.target.checked } : p))
                  )
                }
                className="h-4 w-4 rounded border-border"
              />
              Actif
            </label>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PROVIDER_FIELDS[s.provider].map((f) => (
              <div key={f.key}>
                <label className="text-xs font-medium text-text-muted">{f.label}</label>
                <input
                  value={drafts[s.provider]?.[f.key] ?? ""}
                  onChange={(e) => setDraftField(s.provider, f.key, e.target.value)}
                  placeholder={s.maskedKeys[f.key] || f.placeholder || ""}
                  className="mt-1 w-full rounded-lg border border-border px-2.5 py-1.5 text-sm outline-none focus:border-signal"
                />
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Laissez un champ vide pour conserver sa valeur actuelle — saisissez une
            nouvelle valeur uniquement pour la remplacer.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => save(s.provider, s.enabled)}
              disabled={savingProvider === s.provider}
              className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {savingProvider === s.provider ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Enregistrer
            </button>
            {message[s.provider] && <span className="text-xs text-text-muted">{message[s.provider]}</span>}
          </div>
        </div>
      ))}

      <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-text-muted">
        <strong className="text-text">Stripe</strong> reste configuré via variables
        d&apos;environnement (<code>STRIPE_SECRET_KEY</code>, <code>STRIPE_PRICE_PREMIUM</code>,
        <code> STRIPE_PRICE_PRO</code>) plutôt que depuis cette page, conformément aux
        recommandations de sécurité de Stripe pour les clés secrètes.
      </div>
    </div>
  );
}
