"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";

const PROVIDER_LABELS: Record<string, string> = {
  STRIPE: "Carte bancaire (Stripe)",
  WAVE: "Wave",
  ORANGE_MONEY: "Orange Money",
};

const CHECKOUT_ENDPOINTS: Record<string, string> = {
  STRIPE: "/api/checkout/subscription",
  WAVE: "/api/checkout/wave",
  ORANGE_MONEY: "/api/checkout/orange-money",
};

export default function PlanCard({
  plan,
  name,
  price,
  period,
  features,
  highlighted,
  isFree,
}: {
  plan: "PREMIUM" | "PRO";
  name: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  isFree?: boolean;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [providers, setProviders] = useState<string[] | null>(null);
  const [error, setError] = useState("");

  const payWith = async (provider: string) => {
    setLoading(true);
    setError("");
    const res = await fetch(CHECKOUT_ENDPOINTS[provider], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
      return;
    }
    const data = await res.json();
    setError(data.error ?? "Ce moyen de paiement est momentanément indisponible.");
    setLoading(false);
  };

  const handleClick = async () => {
    if (status !== "authenticated") {
      router.push("/connexion?callbackUrl=/premium");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/payment-providers/enabled");
    const data = await res.json();
    const enabled: string[] = data.enabledProviders ?? [];
    setLoading(false);

    if (enabled.length === 0) {
      // Aucun moyen de paiement actif : on retombe sur la demande manuelle.
      setLoading(true);
      const r = await fetch("/api/upgrade-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      setLoading(false);
      if (r.ok) setDone(true);
      return;
    }

    if (enabled.length === 1) {
      payWith(enabled[0]);
      return;
    }

    setProviders(enabled);
  };

  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-8 ${
        highlighted ? "border-signal bg-white shadow-xl ring-2 ring-signal" : "border-border bg-white"
      }`}
    >
      {highlighted && (
        <span className="mb-3 inline-block w-fit rounded-full bg-signal px-3 py-1 text-xs font-bold text-white">
          Le plus populaire
        </span>
      )}
      <h3 className="font-display text-xl font-semibold text-text">{name}</h3>
      <p className="mt-2">
        <span className="font-display text-3xl font-semibold text-text">{price}</span>
        {period && <span className="text-sm text-text-muted"> /{period}</span>}
      </p>
      <ul className="mt-6 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
            <Check size={16} className="mt-0.5 shrink-0 text-found" />
            {f}
          </li>
        ))}
      </ul>

      {error && <p className="mt-3 text-xs text-alert">{error}</p>}

      {isFree ? (
        <span className="mt-8 rounded-full bg-paper-2 px-4 py-2.5 text-center text-sm font-semibold text-text-muted">
          Votre plan actuel par défaut
        </span>
      ) : done ? (
        <span className="mt-8 rounded-full bg-found/10 px-4 py-2.5 text-center text-sm font-semibold text-found">
          Demande envoyée ✓ notre équipe vous contacte bientôt
        </span>
      ) : (
        <button
          onClick={handleClick}
          disabled={loading}
          className={`mt-8 flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${
            highlighted ? "bg-signal text-white hover:bg-signal-dark" : "bg-ink text-white hover:bg-ink-2"
          }`}
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Chargement..." : `Passer ${name}`}
        </button>
      )}

      {providers && (
        <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/95 p-6 backdrop-blur">
          <button
            onClick={() => setProviders(null)}
            className="absolute right-4 top-4 text-text-muted hover:text-text"
          >
            <X size={16} />
          </button>
          <div className="w-full">
            <p className="mb-3 text-center text-sm font-semibold text-text">Choisissez un moyen de paiement</p>
            <div className="space-y-2">
              {providers.map((p) => (
                <button
                  key={p}
                  onClick={() => payWith(p)}
                  className="w-full rounded-full border border-border py-2.5 text-sm font-medium text-text hover:border-signal hover:text-signal"
                >
                  {PROVIDER_LABELS[p] ?? p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
