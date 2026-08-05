"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, PauseCircle, Wallet, Loader2 } from "lucide-react";

interface Earning {
  id: string;
  amount: number;
  status: string;
}

interface Ambassador {
  id: string;
  zone: string;
  city: string;
  motivation: string | null;
  status: "EN_ATTENTE" | "ACTIF" | "SUSPENDU" | "REJETE";
  commissionRate: number;
  totalEarned: number;
  totalPaidOut: number;
  createdAt: string;
  user: { name: string; email: string; points: number };
  earnings: Earning[];
}

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  ACTIF: "Actif",
  SUSPENDU: "Suspendu",
  REJETE: "Rejeté",
};
const STATUS_COLORS: Record<string, string> = {
  EN_ATTENTE: "bg-gold/10 text-gold",
  ACTIF: "bg-found/10 text-found",
  SUSPENDU: "bg-alert/10 text-alert",
  REJETE: "bg-text-muted/10 text-text-muted",
};

export default function AdminAmbassadorsTable() {
  const [list, setList] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/ambassadors");
    if (res.ok) setList(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setBusyId(id);
    await fetch("/api/admin/ambassadors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
    setBusyId(null);
  };

  const markPaid = async (ambassadorId: string) => {
    setBusyId(ambassadorId);
    const res = await fetch("/api/admin/ambassadors/payout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ambassadorId }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Erreur");
    }
    await load();
    setBusyId(null);
  };

  if (loading) return <p className="text-sm text-text-muted">Chargement...</p>;

  if (list.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
        Aucune candidature ambassadeur pour l&apos;instant.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((a) => {
        const pending = a.totalEarned - a.totalPaidOut;
        return (
          <div key={a.id} className="rounded-2xl border border-border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-text">{a.user.name}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[a.status]}`}>
                    {STATUS_LABELS[a.status]}
                  </span>
                </div>
                <p className="text-xs text-text-muted">{a.user.email}</p>
                <p className="mt-1 text-sm text-text">{a.zone}, {a.city}</p>
                {a.motivation && <p className="mt-1 text-xs italic text-text-muted">&laquo; {a.motivation} &raquo;</p>}
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-right text-xs text-text-muted">
                  <p>Total gagné : <strong className="text-text">{a.totalEarned.toLocaleString("fr-FR")} FCFA</strong></p>
                  <p>En attente : <strong className="text-gold">{pending.toLocaleString("fr-FR")} FCFA</strong></p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {a.status === "EN_ATTENTE" && (
                    <>
                      <button
                        onClick={() => updateStatus(a.id, "ACTIF")}
                        disabled={busyId === a.id}
                        className="flex items-center gap-1 rounded-full bg-found px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        <CheckCircle2 size={12} /> Approuver
                      </button>
                      <button
                        onClick={() => updateStatus(a.id, "REJETE")}
                        disabled={busyId === a.id}
                        className="flex items-center gap-1 rounded-full bg-paper-2 px-3 py-1.5 text-xs font-semibold text-text disabled:opacity-60"
                      >
                        <XCircle size={12} /> Rejeter
                      </button>
                    </>
                  )}
                  {a.status === "ACTIF" && (
                    <>
                      <button
                        onClick={() => markPaid(a.id)}
                        disabled={busyId === a.id || pending <= 0}
                        className="flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                      >
                        {busyId === a.id ? <Loader2 size={12} className="animate-spin" /> : <Wallet size={12} />}
                        Marquer versé
                      </button>
                      <button
                        onClick={() => updateStatus(a.id, "SUSPENDU")}
                        disabled={busyId === a.id}
                        className="flex items-center gap-1 rounded-full bg-alert/10 px-3 py-1.5 text-xs font-semibold text-alert disabled:opacity-60"
                      >
                        <PauseCircle size={12} /> Suspendre
                      </button>
                    </>
                  )}
                  {a.status === "SUSPENDU" && (
                    <button
                      onClick={() => updateStatus(a.id, "ACTIF")}
                      disabled={busyId === a.id}
                      className="flex items-center gap-1 rounded-full bg-found px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      <CheckCircle2 size={12} /> Réactiver
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
