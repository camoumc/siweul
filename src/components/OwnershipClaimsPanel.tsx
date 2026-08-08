"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

interface Claim {
  id: string;
  providedDetail: string;
  score: number;
  status: string;
  createdAt: string;
  claimant: { name: string; email: string; isVerified: boolean };
}

export default function OwnershipClaimsPanel({ reportId }: { reportId: string }) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/reports/${reportId}/claim`);
    if (res.ok) setClaims(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const act = async (claimId: string, status: string) => {
    setBusyId(claimId);
    await fetch(`/api/claims/${claimId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    setBusyId(null);
  };

  if (loading || claims.length === 0) return null;

  return (
    <div className="rounded-3xl border border-signal/30 bg-signal/5 p-6">
      <h2 className="flex items-center gap-2 font-display text-base font-semibold text-text">
        <ShieldCheck size={16} className="text-signal" /> Réclamations reçues ({claims.length})
      </h2>
      <div className="mt-4 space-y-3">
        {claims.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-text">
                {c.claimant.name} {c.claimant.isVerified && <ShieldCheck size={12} className="ml-1 inline text-found" />}
              </p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  c.score >= 85 ? "bg-found/10 text-found" : c.score >= 50 ? "bg-gold/10 text-gold" : "bg-alert/10 text-alert"
                }`}
              >
                {c.score}%
              </span>
            </div>
            <p className="mt-2 rounded-lg bg-paper-2 p-2 text-xs text-text">&laquo; {c.providedDetail} &raquo;</p>
            <p className="mt-1 text-[11px] text-text-muted">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</p>

            {c.status === "EN_ATTENTE" || c.status === "INSUFFISANT" || c.status === "CONFIRME" ? (
              c.status !== "CONFIRME" ? (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => act(c.id, "CONFIRME")}
                    disabled={busyId === c.id}
                    className="flex items-center gap-1 rounded-full bg-found px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    <CheckCircle2 size={12} /> Confirmer
                  </button>
                  <button
                    onClick={() => act(c.id, "REJETE")}
                    disabled={busyId === c.id}
                    className="flex items-center gap-1 rounded-full bg-paper-2 px-3 py-1.5 text-xs font-semibold text-text disabled:opacity-60"
                  >
                    <XCircle size={12} /> Rejeter
                  </button>
                </div>
              ) : (
                <p className="mt-3 text-xs font-semibold text-found">✓ Confirmée — contactez cette personne pour la remise.</p>
              )
            ) : (
              <p className="mt-3 text-xs text-text-muted">Rejetée</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
