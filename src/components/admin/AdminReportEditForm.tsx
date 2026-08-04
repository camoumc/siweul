"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2, Trash2 } from "lucide-react";
import PhotoUploader from "@/components/PhotoUploader";
import { REPORT_TYPES, STATUS_LABELS, SENEGAL_CITIES, type ReportTypeKey } from "@/lib/reportConfig";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

interface ReportData {
  id: string;
  type: ReportTypeKey;
  status: string;
  title: string;
  description: string;
  city: string;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  eventDate: string;
  eventTime: string | null;
  category: string | null;
  color: string | null;
  brand: string | null;
  serialOrVin: string | null;
  reward: number | null;
  contactName: string | null;
  contactPhone: string | null;
  photos: { url: string }[];
  owner: { email: string };
}

export default function AdminReportEditForm({ report }: { report: ReportData }) {
  const router = useRouter();
  const cfg = REPORT_TYPES[report.type];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [photos, setPhotos] = useState<string[]>(report.photos.map((p) => p.url));
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({
    lat: report.latitude ?? undefined,
    lng: report.longitude ?? undefined,
  });

  const [form, setForm] = useState({
    status: report.status,
    title: report.title,
    description: report.description,
    city: report.city,
    district: report.district ?? "",
    eventDate: report.eventDate.slice(0, 10),
    eventTime: report.eventTime ?? "",
    category: report.category ?? "",
    color: report.color ?? "",
    brand: report.brand ?? "",
    serialOrVin: report.serialOrVin ?? "",
    reward: report.reward?.toString() ?? "",
    contactName: report.contactName ?? "",
    contactPhone: report.contactPhone ?? "",
    ownerEmail: report.owner.email,
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const inputClass =
    "mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20";
  const labelClass = "text-sm font-medium text-text";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const payload = {
      ...form,
      reward: form.reward ? Number(form.reward) : undefined,
      latitude: coords.lat,
      longitude: coords.lng,
      photos,
    };

    const res = await fetch(`/api/reports/${report.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erreur");
      return;
    }
    setSuccess(true);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer définitivement ce signalement ?")) return;
    await fetch(`/api/reports/${report.id}`, { method: "DELETE" });
    router.push("/admin/signalements");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-xs font-medium text-alert hover:underline"
        >
          <Trash2 size={13} /> Supprimer ce signalement
        </button>
      </div>

      {error && <p className="rounded-xl bg-alert/10 px-3 py-2 text-sm text-alert">{error}</p>}
      {success && <p className="rounded-xl bg-found/10 px-3 py-2 text-sm text-found">Modifications enregistrées ✓</p>}

      <div>
        <label className={labelClass}>Statut</label>
        <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputClass}>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Titre</label>
        <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Catégorie</label>
          <input value={form.category} onChange={(e) => set("category", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Couleur</label>
          <input value={form.color} onChange={(e) => set("color", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Marque</label>
          <input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>N° série / VIN / plaque</label>
          <input value={form.serialOrVin} onChange={(e) => set("serialOrVin", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Ville</label>
          <select value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass}>
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
          <label className={labelClass}>Date</label>
          <input type="date" value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Heure</label>
          <input type="time" value={form.eventTime} onChange={(e) => set("eventTime", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Position sur la carte</label>
        <div className="mt-1">
          <MapPicker defaultLat={coords.lat ?? 14.7167} defaultLng={coords.lng ?? -17.4677} onChange={(lat, lng) => setCoords({ lat, lng })} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Récompense (FCFA)</label>
        <input type="number" value={form.reward} onChange={(e) => set("reward", e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Photos</label>
        <div className="mt-1">
          <PhotoUploader urls={photos} onChange={setPhotos} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nom de contact</label>
          <input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Téléphone de contact</label>
          <input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Propriétaire (email)</label>
        <input value={form.ownerEmail} onChange={(e) => set("ownerEmail", e.target.value)} className={inputClass} />
        <p className="mt-1 text-xs text-text-muted">
          Changez cet email pour réassigner le signalement à un autre compte SIWEUL existant.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-signal px-6 py-3 font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Enregistrement..." : "Enregistrer les modifications"}
      </button>
    </form>
  );
}
