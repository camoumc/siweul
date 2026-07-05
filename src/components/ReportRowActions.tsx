"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2, Loader2 } from "lucide-react";

export default function ReportRowActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const markResolved = async () => {
    setLoading(true);
    await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "RESOLU" }),
    });
    setLoading(false);
    router.refresh();
  };

  const remove = async () => {
    if (!confirm("Supprimer définitivement ce signalement ?")) return;
    setLoading(true);
    await fetch(`/api/reports/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      {status !== "RESOLU" && (
        <button
          onClick={markResolved}
          disabled={loading}
          className="flex items-center gap-1 rounded-full bg-found/10 px-3 py-1.5 text-xs font-semibold text-found hover:bg-found/20 disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
          Marquer résolu
        </button>
      )}
      <button
        onClick={remove}
        disabled={loading}
        className="flex items-center gap-1 rounded-full bg-alert/10 px-3 py-1.5 text-xs font-semibold text-alert hover:bg-alert/20 disabled:opacity-50"
      >
        <Trash2 size={12} /> Supprimer
      </button>
    </div>
  );
}
