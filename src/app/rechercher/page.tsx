"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import ReportCard, { type ReportCardData } from "@/components/ReportCard";
import { REPORT_TYPE_ORDER, REPORT_TYPES, SENEGAL_CITIES, type ReportTypeKey } from "@/lib/reportConfig";

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<ReportCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const type = searchParams.get("type") ?? "";
  const city = searchParams.get("city") ?? "";
  const q = searchParams.get("q") ?? "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/rechercher?${params.toString()}`);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (city) params.set("city", city);
    if (q) params.set("q", q);
    const res = await fetch(`/api/reports?${params.toString()}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [type, city, q]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-signal">Recherche</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-text">
          {total} signalement{total > 1 ? "s" : ""} actif{total > 1 ? "s" : ""}
        </h1>
      </div>

      <div className="mb-8 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              defaultValue={q}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateParam("q", (e.target as HTMLInputElement).value);
              }}
              onBlur={(e) => updateParam("q", e.target.value)}
              placeholder="Rechercher par mot-clé, marque, description..."
              className="w-full rounded-full border border-border bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium hover:bg-paper-2"
          >
            <SlidersHorizontal size={16} /> Filtres
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-white p-4">
            <select
              value={type}
              onChange={(e) => updateParam("type", e.target.value)}
              className="rounded-xl border border-border px-3 py-2 text-sm"
            >
              <option value="">Toutes les catégories</option>
              {REPORT_TYPE_ORDER.map((t) => (
                <option key={t} value={t}>{REPORT_TYPES[t as ReportTypeKey].labelPlural}</option>
              ))}
            </select>
            <select
              value={city}
              onChange={(e) => updateParam("city", e.target.value)}
              className="rounded-xl border border-border px-3 py-2 text-sm"
            >
              <option value="">Toutes les villes</option>
              {SENEGAL_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Pills rapides par type */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParam("type", "")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              !type ? "bg-ink text-white" : "bg-white text-text-muted border border-border"
            }`}
          >
            Tout
          </button>
          {REPORT_TYPE_ORDER.map((t) => (
            <button
              key={t}
              onClick={() => updateParam("type", t)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                type === t ? "bg-ink text-white" : "bg-white text-text-muted border border-border"
              }`}
            >
              {REPORT_TYPES[t as ReportTypeKey].shortLabel}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-paper-2" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border py-20 text-center">
          <p className="text-text-muted">Aucun signalement ne correspond à votre recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense>
      <BrowseContent />
    </Suspense>
  );
}
