"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Settings2, Search } from "lucide-react";

interface Ambassador {
  id: string;
  zone: string;
  city: string;
  status: "EN_ATTENTE" | "ACTIF" | "SUSPENDU" | "REJETE";
  totalEarned: number;
  totalPaidOut: number;
  createdAt: string;
  user: { name: string; email: string; points: number };
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
  const [filter, setFilter] = useState<string>("TOUS");
  const [search, setSearch] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/ambassadors");
    if (res.ok) setList(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const quickAction = async (id: string, status: string) => {
    setBusyId(id);
    await fetch("/api/admin/ambassadors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    await load();
    setBusyId(null);
  };

  if (loading) return <p className="text-sm text-text-muted">Chargement...</p>;

  const pendingCount = list.filter((a) => a.status === "EN_ATTENTE").length;

  const filtered = list.filter((a) => {
    if (filter !== "TOUS" && a.status !== filter) return false;
    if (search && !`${a.user.name} ${a.user.email} ${a.zone} ${a.city}`.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {["TOUS", "EN_ATTENTE", "ACTIF", "SUSPENDU", "REJETE"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === f ? "bg-ink text-white" : "border border-border text-text-muted hover:bg-paper-2"
            }`}
          >
            {f === "TOUS" ? "Tous" : STATUS_LABELS[f]}
            {f === "EN_ATTENTE" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-alert px-1.5 py-0.5 text-[10px] text-white">{pendingCount}</span>
            )}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="rounded-full border border-border py-1.5 pl-8 pr-3 text-xs outline-none focus:border-signal"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
          {list.length === 0
            ? "Aucune candidature ambassadeur pour l'instant. Elles apparaîtront ici dès qu'un utilisateur postulera depuis /ambassadeur."
            : "Aucun résultat pour ce filtre."}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const pending = a.totalEarned - a.totalPaidOut;
            return (
              <div key={a.id} className="rounded-2xl border border-border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text">{a.user.name}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[a.status]}`}>
                        {STATUS_LABELS[a.status]}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">{a.user.email} · {a.zone}, {a.city}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs text-text-muted">
                      <p>En attente : <strong className="text-gold">{pending.toLocaleString("fr-FR")} FCFA</strong></p>
                    </div>
                    <div className="flex gap-1.5">
                      {a.status === "EN_ATTENTE" && (
                        <>
                          <button
                            onClick={() => quickAction(a.id, "ACTIF")}
                            disabled={busyId === a.id}
                            title="Approuver"
                            className="rounded-full bg-found p-2 text-white disabled:opacity-60"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button
                            onClick={() => quickAction(a.id, "REJETE")}
                            disabled={busyId === a.id}
                            title="Rejeter"
                            className="rounded-full bg-paper-2 p-2 text-text disabled:opacity-60"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      <Link
                        href={`/admin/ambassadeurs/${a.id}`}
                        className="flex items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold text-text hover:bg-paper-2"
                      >
                        <Settings2 size={13} /> Gérer
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
