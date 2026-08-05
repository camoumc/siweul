"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Save,
  ShieldCheck,
  Eye,
  EyeOff,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  CreditCard,
} from "lucide-react";

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
    { key: "country", label: "Code pays", placeholder: "sn" },
  ],
};

const PROVIDER_META: Record<
  string,
  { label: string; help: string; docUrl: string; webhookHint?: string }
> = {
  WAVE: {
    label: "Wave",
    help: "Business Portal Wave > Developer > créez une clé API, puis un webhook pointant vers l'URL ci-dessous.",
    docUrl: "https://docs.wave.com/business",
  },
  ORANGE_MONEY: {
    label: "Orange Money",
    help: "Créez une application Web Payment sur Orange Developer pour obtenir Client ID/Secret, et récupérez votre Merchant Key auprès de votre contrat marchand.",
    docUrl: "https://developer.orange.com",
  },
};

function ProviderCard({
  status,
  onSaved,
}: {
  status: ProviderStatus;
  onSaved: () => void;
}) {
  const meta = PROVIDER_META[status.provider];
  const fields = PROVIDER_FIELDS[status.provider];
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [enabled, setEnabled] = useState(status.enabled);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/${status.provider === "WAVE" ? "wave" : "orange-money"}`
      : "";

  const save = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/admin/payment-providers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: status.provider, enabled, keys: draft }),
    });
    setSaving(false);
    const data = await res.json();
    if (res.ok) {
      setMessage("Enregistré avec succès ✓");
      setDraft({});
      onSaved();
    } else {
      setError(data.error ?? "Erreur lors de l'enregistrement.");
    }
  };

  const reset = async () => {
    if (!confirm(`Effacer toutes les clés ${meta.label} et désactiver ce moyen de paiement ?`)) return;
    setSaving(true);
    const res = await fetch("/api/admin/payment-providers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: status.provider, reset: true }),
    });
    setSaving(false);
    if (res.ok) {
      setEnabled(false);
      setMessage("Clés réinitialisées.");
      onSaved();
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-semibold text-text">{meta.label}</h3>
          {status.configured ? (
            <span className="flex items-center gap-1 rounded-full bg-found/10 px-2 py-0.5 text-xs font-semibold text-found">
              <ShieldCheck size={11} /> Clés enregistrées
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold">
              <AlertTriangle size={11} /> Non configuré
            </span>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Actif sur le site
        </label>
      </div>

      <p className="mt-2 text-xs text-text-muted">{meta.help}</p>
      <a
        href={meta.docUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-signal hover:underline"
      >
        Documentation officielle <ExternalLink size={11} />
      </a>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-medium text-text-muted">{f.label}</label>
            <div className="relative mt-1">
              <input
                type={reveal[f.key] ? "text" : "password"}
                value={draft[f.key] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                placeholder={status.maskedKeys[f.key] || f.placeholder || "Non renseigné"}
                className="w-full rounded-lg border border-border px-2.5 py-1.5 pr-8 text-sm outline-none focus:border-signal"
              />
              <button
                type="button"
                onClick={() => setReveal((r) => ({ ...r, [f.key]: !r[f.key] }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted"
                tabIndex={-1}
              >
                {reveal[f.key] ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl bg-paper-2 px-3 py-2">
        <p className="text-[11px] font-semibold text-text-muted">URL de webhook à renseigner chez {meta.label} :</p>
        <code className="text-xs text-text">{webhookUrl}</code>
      </div>

      {error && <p className="mt-3 rounded-lg bg-alert/10 px-3 py-2 text-xs text-alert">{error}</p>}
      {message && <p className="mt-3 text-xs text-found">{message}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Enregistrer
        </button>
        {status.configured && (
          <button
            onClick={reset}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-text-muted hover:text-alert disabled:opacity-60"
          >
            <RotateCcw size={12} /> Réinitialiser
          </button>
        )}
        {status.updatedAt && (
          <span className="text-[11px] text-text-muted">
            Mis à jour le {new Date(status.updatedAt).toLocaleDateString("fr-FR")}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PaymentProvidersConfig() {
  const [statuses, setStatuses] = useState<ProviderStatus[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/admin/payment-providers");
      const data = await res.json();
      if (!res.ok) {
        setLoadError(data.error ?? "Erreur inconnue.");
        setStatuses(null);
      } else {
        setStatuses(data);
      }
    } catch {
      setLoadError("Impossible de contacter le serveur.");
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <Loader2 size={16} className="animate-spin" /> Chargement...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-alert/30 bg-alert/5 p-6">
        <div className="flex items-center gap-2 text-alert">
          <AlertTriangle size={18} />
          <p className="font-semibold">Impossible de charger la configuration</p>
        </div>
        <p className="mt-2 text-sm text-text">{loadError}</p>
        <button
          onClick={load}
          className="mt-4 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!statuses) return null;

  const mobileMoneyProviders = statuses.filter((s) => s.provider !== "STRIPE");
  const stripeStatus = statuses.find((s) => s.provider === "STRIPE");
  const activeCount = statuses.filter((s) => s.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-white p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-2">
          <CreditCard size={18} className="text-signal" />
        </span>
        <div>
          <p className="font-display text-lg font-semibold text-text">
            {activeCount} / {statuses.length} moyens de paiement actifs
          </p>
          <p className="text-xs text-text-muted">
            Les clés sont chiffrées (AES-256-GCM) avant d&apos;être stockées en base.
          </p>
        </div>
      </div>

      {mobileMoneyProviders.map((s) => (
        <ProviderCard key={s.provider} status={s} onSaved={load} />
      ))}

      {stripeStatus && (
        <div className="rounded-3xl border border-dashed border-border p-6">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-text">Stripe</h3>
            {stripeStatus.configured ? (
              <span className="flex items-center gap-1 rounded-full bg-found/10 px-2 py-0.5 text-xs font-semibold text-found">
                <ShieldCheck size={11} /> Configuré
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-xs font-semibold text-gold">
                <AlertTriangle size={11} /> Non configuré
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-text-muted">
            Par sécurité, Stripe reste configuré via <strong>variables d&apos;environnement</strong>{" "}
            (<code>STRIPE_SECRET_KEY</code>, <code>STRIPE_WEBHOOK_SECRET</code>,{" "}
            <code>STRIPE_PRICE_PREMIUM</code>, <code>STRIPE_PRICE_PRO</code>) plutôt que depuis
            cette page — c&apos;est la recommandation de sécurité de Stripe pour les clés secrètes
            de production. Modifiez-les depuis votre hébergeur (Vercel &gt; Settings &gt;
            Environment Variables).
          </p>
          <Link
            href="https://dashboard.stripe.com/apikeys"
            target="_blank"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-signal hover:underline"
          >
            Dashboard Stripe <ExternalLink size={11} />
          </Link>
        </div>
      )}
    </div>
  );
}
