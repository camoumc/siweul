"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Wallet,
  Trash2,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { SENEGAL_CITIES } from "@/lib/reportConfig";

interface Earning {
  id: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
}

interface AmbassadorDetail {
  id: string;
  zone: string;
  city: string;
  motivation: string | null;
  status: "EN_ATTENTE" | "ACTIF" | "SUSPENDU" | "REJETE";
  commissionRate: number;
  totalEarned: number;
  totalPaidOut: number;
  createdAt: string;
  user: { id: string; name: string; email: string; phone: string | null; points: number; createdAt: string };
  earnings: Earning[];
}

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  ACTIF: "Actif",
  SUSPENDU: "Suspendu",
  REJETE: "Rejeté",
};

export default function AdminAmbassadorDetail({ ambassadorId }: { ambassadorId: string }) {
  const router = useRouter();
  const [data, setData] = useState<AmbassadorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [zone, setZone] = useState("");
  const [city, setCity] = useState("");
  const [commissionRate, setCommissionRate] = useState(500);

  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustSign, setAdjustSign] = useState<1 | -1>(1);

  const load = async () => {
    const res = await fetch(`/api/admin/ambassadors/${ambassadorId}`);
    if (res.ok) {
      const d = await res.json();
      setData(d);
      setZone(d.zone);
      setCity(d.city);
      setCommissionRate(d.commissionRate);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambassadorId]);

  const updateStatus = async (status: string) => {
    setSaving(true);
    await fetch("/api/admin/ambassadors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ambassadorId, status }),
    });
    await load();
    setSaving(false);
  };

  const saveDetails = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/ambassadors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ambassadorId, zone, city, commissionRate }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Enregistré ✓");
      await load();
    }
  };

  const markPaid = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/ambassadors/payout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ambassadorId }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? "Erreur");
    }
    await load();
    setSaving(false);
  };

  const submitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustAmount || !adjustReason) return;
    setSaving(true);
    await fetch("/api/admin/ambassadors/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ambassadorId,
        amount: adjustSign * Number(adjustAmount),
        reason: adjustReason,
      }),
    });
    setAdjustAmount("");
    setAdjustReason("");
    await load();
    setSaving(false);
  };

  const deleteAmbassador = async () => {
    if (!confirm(`Supprimer définitivement le profil ambassadeur de ${data?.user.name} ? Cette action est irréversible.`)) return;
    setSaving(true);
    await fetch("/api/admin/ambassadors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ambassadorId }),
    });
    router.push("/admin/ambassadeurs");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-text-muted" size={24} />
      </div>
    );
  }
  if (!data) return <p className="text-sm text-alert">Ambassadeur introuvable.</p>;

  const pending = data.totalEarned - data.totalPaidOut;
  const inputClass =
    "mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-signal focus:ring-2 focus:ring-signal/20";

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble + actions de statut */}
      <div className="rounded-3xl border border-border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg font-semibold text-text">{data.user.name}</p>
            <p className="text-sm text-text-muted">{data.user.email} {data.user.phone && `· ${data.user.phone}`}</p>
            <p className="mt-1 text-xs text-text-muted">
              Membre depuis {new Date(data.user.createdAt).toLocaleDateString("fr-FR")} · {data.user.points} points
            </p>
          </div>
          <span className="rounded-full bg-paper-2 px-3 py-1 text-xs font-semibold text-text">
            {STATUS_LABELS[data.status]}
          </span>
        </div>

        {data.motivation && (
          <p className="mt-3 rounded-xl bg-paper-2 p-3 text-sm italic text-text-muted">&laquo; {data.motivation} &raquo;</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {data.status === "EN_ATTENTE" && (
            <>
              <button onClick={() => updateStatus("ACTIF")} disabled={saving} className="flex items-center gap-1.5 rounded-full bg-found px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
                <CheckCircle2 size={13} /> Approuver
              </button>
              <button onClick={() => updateStatus("REJETE")} disabled={saving} className="flex items-center gap-1.5 rounded-full bg-paper-2 px-4 py-2 text-xs font-semibold text-text disabled:opacity-60">
                <XCircle size={13} /> Rejeter
              </button>
            </>
          )}
          {data.status === "ACTIF" && (
            <button onClick={() => updateStatus("SUSPENDU")} disabled={saving} className="flex items-center gap-1.5 rounded-full bg-alert/10 px-4 py-2 text-xs font-semibold text-alert disabled:opacity-60">
              <PauseCircle size={13} /> Suspendre
            </button>
          )}
          {data.status === "SUSPENDU" && (
            <button onClick={() => updateStatus("ACTIF")} disabled={saving} className="flex items-center gap-1.5 rounded-full bg-found px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
              <CheckCircle2 size={13} /> Réactiver
            </button>
          )}
          {data.status === "REJETE" && (
            <button onClick={() => updateStatus("ACTIF")} disabled={saving} className="flex items-center gap-1.5 rounded-full bg-found px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
              <CheckCircle2 size={13} /> Approuver quand même
            </button>
          )}
          <button onClick={deleteAmbassador} disabled={saving} className="ml-auto flex items-center gap-1.5 rounded-full border border-alert/30 px-4 py-2 text-xs font-semibold text-alert hover:bg-alert/5 disabled:opacity-60">
            <Trash2 size={13} /> Supprimer le profil
          </button>
        </div>
      </div>

      {/* Finances */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="font-display text-xl font-semibold text-text">{data.totalEarned.toLocaleString("fr-FR")} FCFA</p>
          <p className="text-xs text-text-muted">Total gagné</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="font-display text-xl font-semibold text-gold">{pending.toLocaleString("fr-FR")} FCFA</p>
          <p className="text-xs text-text-muted">En attente de versement</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="font-display text-xl font-semibold text-found">{data.totalPaidOut.toLocaleString("fr-FR")} FCFA</p>
          <p className="text-xs text-text-muted">Déjà versé</p>
        </div>
      </div>
      <button
        onClick={markPaid}
        disabled={saving || pending <= 0}
        className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
      >
        <Wallet size={13} /> Marquer {pending.toLocaleString("fr-FR")} FCFA comme versés
      </button>

      {/* Edition zone / ville / commission */}
      <div className="rounded-3xl border border-border bg-white p-6">
        <h3 className="font-display text-base font-semibold text-text">Zone & commission</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-text-muted">Ville</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
              {SENEGAL_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted">Quartier / zone</label>
            <input value={zone} onChange={(e) => setZone(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted">Commission par action (FCFA)</label>
            <input type="number" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} className={inputClass} />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={saveDetails} disabled={saving} className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Enregistrer
          </button>
          {message && <span className="text-xs text-found">{message}</span>}
        </div>
      </div>

      {/* Ajustement manuel */}
      <div className="rounded-3xl border border-border bg-white p-6">
        <h3 className="font-display text-base font-semibold text-text">Ajustement manuel (bonus / correction)</h3>
        <form onSubmit={submitAdjustment} className="mt-3 space-y-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => setAdjustSign(1)} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${adjustSign === 1 ? "bg-found text-white" : "border border-border text-text-muted"}`}>
              <PlusCircle size={12} /> Ajouter
            </button>
            <button type="button" onClick={() => setAdjustSign(-1)} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${adjustSign === -1 ? "bg-alert text-white" : "border border-border text-text-muted"}`}>
              <MinusCircle size={12} /> Retirer
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="number"
              required
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
              placeholder="Montant FCFA"
              className={inputClass}
            />
            <input
              required
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="Raison (ex : bonus fidélité)"
              className={`sm:col-span-2 ${inputClass}`}
            />
          </div>
          <button type="submit" disabled={saving} className="rounded-full bg-signal px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
            Valider l&apos;ajustement
          </button>
        </form>
      </div>

      {/* Historique complet */}
      <div>
        <h3 className="mb-3 font-display text-base font-semibold text-text">Historique complet des gains</h3>
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          {data.earnings.length === 0 ? (
            <p className="p-6 text-center text-sm text-text-muted">Aucun gain pour l&apos;instant.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-paper-2 text-left text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-2">Raison</th>
                  <th className="px-4 py-2">Montant</th>
                  <th className="px-4 py-2">Statut</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.earnings.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-4 py-2.5 text-text">{e.reason}</td>
                    <td className={`px-4 py-2.5 font-medium ${e.amount < 0 ? "text-alert" : "text-text"}`}>
                      {e.amount > 0 ? "+" : ""}{e.amount.toLocaleString("fr-FR")} FCFA
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${e.status === "VERSE" ? "bg-found/10 text-found" : "bg-gold/10 text-gold"}`}>
                        {e.status === "VERSE" ? "Versé" : "En attente"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-text-muted">{new Date(e.createdAt).toLocaleDateString("fr-FR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
