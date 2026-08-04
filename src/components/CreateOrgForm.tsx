"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";

const TYPES = [
  "Aéroport",
  "Gare",
  "Hôtel",
  "Université / École",
  "Entreprise de transport",
  "Centre commercial",
  "Ambassade",
  "Commissariat",
  "Gendarmerie",
  "Mairie",
  "Hôpital",
  "Association",
  "Autre",
];

export default function CreateOrgForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erreur");
      return;
    }
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Building2 className="text-signal" size={32} />
      <h1 className="mt-3 font-display text-3xl font-semibold text-text">
        Créez votre espace organisation
      </h1>
      <p className="mt-2 text-text-muted">
        Publiez des signalements au nom de votre structure, suivez vos statistiques et
        gérez votre équipe.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-3xl border border-border bg-white p-6 shadow-sm">
        {error && <p className="rounded-xl bg-alert/10 px-3 py-2 text-sm text-alert">{error}</p>}
        <div>
          <label className="text-sm font-medium text-text">Nom de l&apos;organisation</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Aéroport Blaise Diagne, Hôtel Terrou-Bi..."
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-text">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-signal px-4 py-2.5 font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Création..." : "Créer mon organisation"}
        </button>
        <p className="text-xs text-text-muted">
          Un badge &laquo; vérifié &raquo; sera activé par notre équipe après validation de votre structure.
        </p>
      </form>
    </div>
  );
}
