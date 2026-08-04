"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

interface Flag {
  id: string;
  reason: string;
  status: "EN_ATTENTE" | "TRAITE" | "REJETE";
  createdAt: string;
  reporter: { name: string; email: string };
  report: { id: string; title: string; type: string; status: string };
}

export default function FlagsTable() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/flags");
      if (res.ok) setFlags(await res.json());
      setLoading(false);
    };
    load();
  }, []);

  const updateStatus = async (id: string, status: Flag["status"]) => {
    setFlags((fs) => fs.map((f) => (f.id === id ? { ...f, status } : f)));
    await fetch("/api/admin/flags", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  };

  if (loading) return <p className="text-sm text-text-muted">Chargement...</p>;

  if (flags.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
        Aucune annonce signalée pour l&apos;instant. 🎉
      </p>
    );
  }

  const statusBadge = (s: Flag["status"]) => {
    if (s === "TRAITE") return "bg-found/10 text-found";
    if (s === "REJETE") return "bg-text-muted/10 text-text-muted";
    return "bg-alert/10 text-alert";
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-paper-2 text-left text-xs uppercase text-text-muted">
          <tr>
            <th className="px-4 py-2">Annonce</th>
            <th className="px-4 py-2">Raison</th>
            <th className="px-4 py-2">Signalé par</th>
            <th className="px-4 py-2">Statut</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {flags.map((f) => (
            <tr key={f.id} className="border-t border-border align-top">
              <td className="px-4 py-3">
                <Link href={`/annonces/${f.report.id}`} target="_blank" className="flex items-center gap-1 font-medium text-signal hover:underline">
                  {f.report.title} <ExternalLink size={12} />
                </Link>
                <p className="text-xs text-text-muted">{new Date(f.createdAt).toLocaleDateString("fr-FR")}</p>
              </td>
              <td className="max-w-xs px-4 py-3 text-text">{f.reason}</td>
              <td className="px-4 py-3 text-text-muted">{f.reporter.name}<br /><span className="text-xs">{f.reporter.email}</span></td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(f.status)}`}>
                  {f.status === "EN_ATTENTE" ? "En attente" : f.status === "TRAITE" ? "Traité" : "Rejeté"}
                </span>
              </td>
              <td className="px-4 py-3">
                {f.status === "EN_ATTENTE" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(f.id, "TRAITE")}
                      title="Marquer comme traité (action prise)"
                      className="flex items-center gap-1 rounded-full bg-found px-2.5 py-1 text-xs font-semibold text-white"
                    >
                      <CheckCircle2 size={12} /> Traiter
                    </button>
                    <button
                      onClick={() => updateStatus(f.id, "REJETE")}
                      title="Rejeter le signalement (annonce légitime)"
                      className="flex items-center gap-1 rounded-full bg-paper-2 px-2.5 py-1 text-xs font-semibold text-text"
                    >
                      <XCircle size={12} /> Rejeter
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
