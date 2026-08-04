"use client";

import { useState } from "react";
import { Flag as FlagIcon, X } from "lucide-react";

export default function FlagButton({ reportId }: { reportId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/reports/${reportId}/flag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erreur");
      return;
    }
    setDone(true);
  };

  if (done) {
    return <p className="text-xs text-text-muted">Signalement envoyé, merci — notre équipe va l&apos;examiner.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-alert"
      >
        <FlagIcon size={13} /> Signaler cette annonce
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text">Signaler cette annonce</p>
        <button type="button" onClick={() => setOpen(false)} className="text-text-muted">
          <X size={14} />
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-alert">{error}</p>}
      <textarea
        required
        rows={2}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Pourquoi cette annonce vous semble suspecte ?"
        className="mt-2 w-full rounded-lg border border-border px-2 py-1.5 text-sm outline-none focus:border-signal"
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-full bg-alert px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Envoi..." : "Envoyer le signalement"}
      </button>
    </form>
  );
}
