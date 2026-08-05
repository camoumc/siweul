"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Loader2 } from "lucide-react";
import { SENEGAL_CITIES } from "@/lib/reportConfig";

export default function AmbassadorApplyForm() {
  const router = useRouter();
  const [zone, setZone] = useState("");
  const [city, setCity] = useState(SENEGAL_CITIES[0]);
  const [motivation, setMotivation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/ambassador", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zone, city, motivation }),
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
      <Megaphone className="text-signal" size={32} />
      <h1 className="mt-3 font-display text-3xl font-semibold text-text">
        Devenez Ambassadeur SIWEUL
      </h1>
      <p className="mt-2 text-text-muted">
        Aidez votre quartier à retrouver ce qui compte : publiez des objets trouvés,
        accompagnez les utilisateurs, et gagnez une commission à chaque signalement
        résolu grâce à vous.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-3xl border border-border bg-white p-6 shadow-sm">
        {error && <p className="rounded-xl bg-alert/10 px-3 py-2 text-sm text-alert">{error}</p>}
        <div>
          <label className="text-sm font-medium text-text">Ville</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
          >
            {SENEGAL_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-text">Quartier / secteur couvert</label>
          <input
            required
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="Ex : Medina, Plateau, Sacré-Cœur..."
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-text">Pourquoi voulez-vous devenir ambassadeur ?</label>
          <textarea
            rows={3}
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-signal px-4 py-2.5 font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Envoi..." : "Envoyer ma candidature"}
        </button>
        <p className="text-xs text-text-muted">
          Votre candidature sera examinée par l&apos;équipe SIWEUL. Vous recevrez une
          notification dès qu&apos;elle sera traitée.
        </p>
      </form>
    </div>
  );
}
