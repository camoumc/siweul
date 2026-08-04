"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, Trash2, Archive, Pencil } from "lucide-react";
import { REPORT_TYPES, STATUS_LABELS, type ReportTypeKey } from "@/lib/reportConfig";

interface AdminReport {
  id: string;
  type: string;
  title: string;
  status: string;
  city: string;
  createdAt: string;
  owner: { name: string; email: string };
}

export default function AdminReportsTable() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/reports?${params.toString()}`);
    if (res.ok) setReports(await res.json());
    setLoading(false);
  }, [status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce signalement ?")) return;
    await fetch(`/api/reports/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {["", "ACTIVE", "EN_VERIFICATION", "RESOLU", "ARCHIVE"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              status === s ? "bg-ink text-white" : "border border-border text-text-muted"
            }`}
          >
            {s ? STATUS_LABELS[s] : "Tous"}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper-2 text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Auteur</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">Chargement...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">Aucun signalement.</td></tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <Link href={`/annonces/${r.id}`} className="font-medium text-text hover:text-signal">
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${REPORT_TYPES[r.type as ReportTypeKey]?.bg} ${REPORT_TYPES[r.type as ReportTypeKey]?.color}`}>
                      {REPORT_TYPES[r.type as ReportTypeKey]?.shortLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{r.owner.name}</td>
                  <td className="px-4 py-3 text-text-muted">{r.city}</td>
                  <td className="px-4 py-3 text-text-muted">{STATUS_LABELS[r.status]}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Link href={`/admin/signalements/${r.id}`} className="rounded-lg p-1.5 text-signal hover:bg-signal/10" title="Modifier">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => updateStatus(r.id, "RESOLU")} className="rounded-lg p-1.5 text-found hover:bg-found/10" title="Marquer résolu">
                        <CheckCircle2 size={14} />
                      </button>
                      <button onClick={() => updateStatus(r.id, "ARCHIVE")} className="rounded-lg p-1.5 text-text-muted hover:bg-paper-2" title="Archiver">
                        <Archive size={14} />
                      </button>
                      <button onClick={() => remove(r.id)} className="rounded-lg p-1.5 text-alert hover:bg-alert/10" title="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
