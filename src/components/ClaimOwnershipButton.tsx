"use client";

import { useState } from "react";
import { ShieldQuestion, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export default function ClaimOwnershipButton({ reportId }: { reportId: string }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; label: string; reasons: string[] } | null>(null);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/reports/${reportId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providedDetail: detail }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Erreur");
      return;
    }
    setResult(data);
  };

  if (result) {
    const Icon = result.score >= 85 ? CheckCircle2 : result.score >= 50 ? AlertTriangle : XCircle;
    const color = result.score >= 85 ? "text-found" : result.score >= 50 ? "text-gold" : "text-alert";
    return (
      <div className="rounded-2xl border border-border bg-white p-4">
        <div className={`flex items-center gap-2 ${color}`}>
          <Icon size={18} />
          <p className="font-semibold">{result.label} — {result.score}%</p>
        </div>
        <ul className="mt-2 space-y-0.5 text-xs text-text-muted">
          {result.reasons.map((r) => <li key={r}>• {r}</li>)}
        </ul>
        <p className="mt-3 text-xs text-text-muted">
          Le déclarant a été notifié de votre demande et doit la valider manuellement avant
          toute remise.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-full border border-signal px-4 py-2.5 text-sm font-semibold text-signal hover:bg-signal/5"
      >
        <ShieldQuestion size={15} /> Réclamer cet objet
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-white p-4">
      <p className="text-sm font-semibold text-text">Prouvez que c&apos;est le vôtre</p>
      <p className="mt-1 text-xs text-text-muted">
        Décrivez un détail unique (IMEI, code, rayure, contenu, numéro de série...) que
        seul le vrai propriétaire connaîtrait. Notre système calcule automatiquement un
        score de vraisemblance.
      </p>
      {error && <p className="mt-2 text-xs text-alert">{error}</p>}
      <textarea
        required
        rows={3}
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        className="mt-2 w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-signal"
        placeholder="Ex : IMEI 356789..., une rayure au dos, coque rouge avec autocollant..."
      />
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full bg-signal px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {loading && <Loader2 size={12} className="animate-spin" />}
          Vérifier et envoyer
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-4 py-2 text-xs font-semibold text-text-muted hover:bg-paper-2"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
