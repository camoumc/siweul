"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import PhotoUploader from "@/components/PhotoUploader";
import { REPORT_TYPES, SENEGAL_CITIES, type ReportTypeKey } from "@/lib/reportConfig";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[280px] animate-pulse rounded-2xl bg-paper-2" />,
});

export default function ReportForm({ type }: { type: ReportTypeKey }) {
  const cfg = REPORT_TYPES[type];
  const router = useRouter();
  const { status } = useSession();
  const [orgName, setOrgName] = useState<string | null>(null);
  const [publishAsOrg, setPublishAsOrg] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/organizations")
      .then((r) => (r.ok ? r.json() : null))
      .then((org) => setOrgName(org?.name ?? null))
      .catch(() => {});
  }, [status]);

  const [photos, setPhotos] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<{
    category: string;
    color: string | null;
    brand: string | null;
  } | null>(null);
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isPersonne = type === "PERSONNE_DISPARUE";
  const isAnimal = type === "ANIMAL_PERDU";
  const isVehicule = type === "VEHICULE_VOLE";
  const isFound = type === "OBJET_TROUVE";

  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    district: "",
    eventDate: "",
    eventTime: "",
    category: "",
    color: "",
    brand: "",
    serialOrVin: "",
    reward: "",
    personName: "",
    personAge: "",
    personGender: "",
    lastSeenDesc: "",
    clothingDesc: "",
    emergencyPhone: "",
    animalSpecies: "",
    microchip: "",
    hiddenDetail: "",
    contactName: "",
    contactPhone: "",
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const analyzeFirstPhoto = async () => {
    if (photos.length === 0) return;
    setAiLoading(true);
    setAiError("");
    setAiSuggestion(null);
    const res = await fetch("/api/ai/analyze-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: photos[0] }),
    });
    const data = await res.json();
    setAiLoading(false);
    if (!res.ok) {
      setAiError(data.error ?? "Analyse indisponible pour le moment.");
      return;
    }
    setAiSuggestion({ category: data.category, color: data.color, brand: data.brand });
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    if (aiSuggestion.color) set("color", aiSuggestion.color);
    if (aiSuggestion.brand) set("brand", aiSuggestion.brand);
    setAiSuggestion(null);
  };

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-text">Connexion requise</h1>
        <p className="mt-2 text-text-muted">
          Créez un compte ou connectez-vous pour publier un signalement.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/connexion" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold">
            Connexion
          </Link>
          <Link href="/inscription" className="rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-white">
            Créer un compte
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      type,
      title: form.title,
      description: form.description,
      city: form.city,
      district: form.district || undefined,
      latitude: coords.lat,
      longitude: coords.lng,
      eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : new Date().toISOString(),
      eventTime: form.eventTime || undefined,
      category: form.category || undefined,
      color: form.color || undefined,
      brand: form.brand || undefined,
      serialOrVin: form.serialOrVin || undefined,
      reward: form.reward ? Number(form.reward) : undefined,
      personName: form.personName || undefined,
      personAge: form.personAge ? Number(form.personAge) : undefined,
      personGender: form.personGender || undefined,
      lastSeenDesc: form.lastSeenDesc || undefined,
      clothingDesc: form.clothingDesc || undefined,
      emergencyPhone: form.emergencyPhone || undefined,
      animalSpecies: form.animalSpecies || undefined,
      microchip: form.microchip || undefined,
      hiddenDetail: form.hiddenDetail || undefined,
      contactName: form.contactName || undefined,
      contactPhone: form.contactPhone || undefined,
      photos,
      publishAsOrganization: publishAsOrg,
    };

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }
    router.push(`/annonces/${data.id}`);
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20";
  const labelClass = "text-sm font-medium text-text";

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <span className={`inline-flex rounded-full ${cfg.bg} px-3 py-1 text-xs font-bold ${cfg.color}`}>
        {cfg.shortLabel}
      </span>
      <h1 className="mt-3 font-display text-3xl font-semibold text-text">{cfg.label}</h1>
      <p className="mt-1 text-text-muted">{cfg.description}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
        {error && <p className="rounded-xl bg-alert/10 px-3 py-2 text-sm text-alert">{error}</p>}

        <div>
          <label className={labelClass}>Titre du signalement</label>
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder={isPersonne ? "Ex : Disparition d'un enfant à Médina" : "Ex : iPhone 14 noir avec coque rouge"}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Description détaillée</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className={inputClass}
          />
        </div>

        {cfg.categories && (
          <div>
            <label className={labelClass}>Catégorie</label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputClass}
            >
              <option value="">Sélectionner...</option>
              {cfg.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Champs spécifiques : personne disparue */}
        {isPersonne && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Nom complet</label>
              <input value={form.personName} onChange={(e) => set("personName", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Âge</label>
              <input type="number" value={form.personAge} onChange={(e) => set("personAge", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sexe</label>
              <select value={form.personGender} onChange={(e) => set("personGender", e.target.value)} className={inputClass}>
                <option value="">—</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Numéro d&apos;urgence</label>
              <input value={form.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Vêtements portés</label>
              <input value={form.clothingDesc} onChange={(e) => set("clothingDesc", e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Dernière localisation connue</label>
              <input value={form.lastSeenDesc} onChange={(e) => set("lastSeenDesc", e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        {/* Champs spécifiques : animal */}
        {isAnimal && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Espèce</label>
              <input value={form.animalSpecies} onChange={(e) => set("animalSpecies", e.target.value)} className={inputClass} placeholder="Chien, chat, cheval..." />
            </div>
            <div>
              <label className={labelClass}>Puce électronique / tatouage</label>
              <input value={form.microchip} onChange={(e) => set("microchip", e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        {/* Champs communs objets / véhicules / documents */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Couleur</label>
            <input value={form.color} onChange={(e) => set("color", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Marque {isVehicule ? "/ Modèle" : ""}</label>
            <input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>
              {isVehicule ? "Numéro VIN / Plaque d'immatriculation" : "Numéro de série (facultatif)"}
            </label>
            <input value={form.serialOrVin} onChange={(e) => set("serialOrVin", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Ville</label>
            <select required value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass}>
              <option value="">Sélectionner...</option>
              {SENEGAL_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Quartier</label>
            <input value={form.district} onChange={(e) => set("district", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Récompense (FCFA)</label>
            <input type="number" value={form.reward} onChange={(e) => set("reward", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Date</label>
            <input type="date" required value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Heure (facultatif)</label>
            <input type="time" value={form.eventTime} onChange={(e) => set("eventTime", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Position sur la carte</label>
          <div className="mt-1">
            <MapPicker onChange={(lat, lng) => setCoords({ lat, lng })} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Photos</label>
          <div className="mt-1">
            <PhotoUploader urls={photos} onChange={setPhotos} />
          </div>
          {photos.length > 0 && (
            <button
              type="button"
              onClick={analyzeFirstPhoto}
              disabled={aiLoading}
              className="mt-2 flex items-center gap-1.5 rounded-full border border-signal/40 px-3 py-1.5 text-xs font-semibold text-signal hover:bg-signal/5 disabled:opacity-60"
            >
              {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {aiLoading ? "Analyse en cours..." : "Pré-remplir avec l'IA à partir de la photo"}
            </button>
          )}
          {aiError && <p className="mt-1 text-xs text-text-muted">{aiError}</p>}
          {aiSuggestion && (
            <div className="mt-2 rounded-xl bg-paper-2 p-3 text-xs text-text">
              <p className="font-semibold">L&apos;IA propose : {aiSuggestion.category}
                {aiSuggestion.color ? `, ${aiSuggestion.color}` : ""}
                {aiSuggestion.brand ? `, ${aiSuggestion.brand}` : ""}
              </p>
              <button
                type="button"
                onClick={applyAiSuggestion}
                className="mt-1.5 rounded-full bg-signal px-3 py-1 text-[11px] font-semibold text-white"
              >
                Appliquer aux champs ci-dessus
              </button>
            </div>
          )}
        </div>

        {isFound && (
          <div>
            <label className={labelClass}>
              Détail caché (pour vérifier le vrai propriétaire)
            </label>
            <input
              value={form.hiddenDetail}
              onChange={(e) => set("hiddenDetail", e.target.value)}
              placeholder="Ex : une rayure sur le coin gauche, un autocollant à l'intérieur..."
              className={inputClass}
            />
            <p className="mt-1 text-xs text-text-muted">
              Ce détail ne sera jamais affiché publiquement. Il vous servira à vérifier que la
              personne qui vous contacte est bien le véritable propriétaire.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Votre nom (affiché publiquement)</label>
            <input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Téléphone (privé, jamais public)</label>
            <input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} className={inputClass} />
          </div>
        </div>

        {orgName && (
          <label className="flex items-center gap-2 rounded-xl bg-paper-2 px-4 py-3 text-sm text-text">
            <input
              type="checkbox"
              checked={publishAsOrg}
              onChange={(e) => setPublishAsOrg(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Publier au nom de <strong>{orgName}</strong>
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-signal px-6 py-3 font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Publier le signalement
        </button>
      </form>
    </div>
  );
}
