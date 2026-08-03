"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

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

  const handleClick = async () => {
    if (status !== "authenticated") {
      router.push("/connexion?callbackUrl=/premium");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/upgrade-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setLoading(false);
    if (res.ok) setDone(true);
  };

  return (
    <div
      className={`flex flex-col rounded-3xl border p-8 ${
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
          {loading ? "Envoi..." : `Passer ${name}`}
        </button>
      )}
    </div>
  );
}
