"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, Loader2, Sparkles, Search } from "lucide-react";
import { REPORT_TYPES, type ReportTypeKey } from "@/lib/reportConfig";

interface Result {
  id: string;
  title: string;
  type: string;
  city: string;
  photo: string | null;
  score: number;
  reasons: string[];
}

export default function PhotoSearchPage() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{ category: string; color: string | null; brand: string | null; summary: string } | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setResults(null);
    setAnalysis(null);
    setUploading(true);

    const form = new FormData();
    form.append("file", file);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
    const uploadData = await uploadRes.json();
    setUploading(false);

    if (!uploadRes.ok) {
      setError(uploadData.error ?? "Échec de l'envoi de la photo.");
      return;
    }
    setPreview(uploadData.url);

    setAnalyzing(true);
    const res = await fetch("/api/ai/reverse-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: uploadData.url }),
    });
    const data = await res.json();
    setAnalyzing(false);

    if (!res.ok) {
      setError(data.error ?? "Erreur lors de la recherche.");
      return;
    }
    setAnalysis(data.analysis);
    setResults(data.results);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <p className="text-sm font-semibold uppercase tracking-wide text-signal">Recherche par photo</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-text">
        Prenez une photo, on retrouve l&apos;annonce
      </h1>
      <p className="mt-2 text-text-muted">
        Notre IA analyse votre photo (type d&apos;objet, couleur, marque, particularités) et
        cherche automatiquement les annonces qui correspondent le mieux.
      </p>

      {!preview ? (
        <label className="mt-8 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border bg-white p-16 text-center hover:border-signal">
          {uploading ? (
            <Loader2 className="animate-spin text-signal" size={32} />
          ) : (
            <Camera className="text-signal" size={32} />
          )}
          <p className="font-semibold text-text">{uploading ? "Envoi de la photo..." : "Cliquez pour choisir une photo"}</p>
          <p className="text-xs text-text-muted">JPG, PNG — 8 Mo max</p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="mt-8">
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Photo analysée" className="h-48 w-48 shrink-0 rounded-2xl object-cover" />
            <div className="flex-1">
              {analyzing ? (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <Loader2 size={16} className="animate-spin" /> Analyse de la photo par l&apos;IA...
                </div>
              ) : analysis ? (
                <div className="rounded-2xl bg-paper-2 p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-text">
                    <Sparkles size={14} className="text-signal" /> Ce que l&apos;IA a détecté
                  </p>
                  <p className="mt-1 text-sm text-text-muted">{analysis.summary}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                    <span className="rounded-full bg-white px-2 py-1 font-medium text-text">{analysis.category}</span>
                    {analysis.color && <span className="rounded-full bg-white px-2 py-1 font-medium text-text">{analysis.color}</span>}
                    {analysis.brand && <span className="rounded-full bg-white px-2 py-1 font-medium text-text">{analysis.brand}</span>}
                  </div>
                </div>
              ) : null}
              {error && <p className="mt-3 rounded-xl bg-alert/10 px-3 py-2 text-sm text-alert">{error}</p>}
              <label className="mt-3 inline-block cursor-pointer text-xs font-semibold text-signal hover:underline">
                Essayer une autre photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          {results && (
            <div className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-text">
                <Search size={18} className="text-signal" /> {results.length} correspondance(s) trouvée(s)
              </h2>
              {results.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-text-muted">
                  Aucune annonce ne correspond suffisamment. Essayez de{" "}
                  <Link href="/signaler" className="font-semibold text-signal">publier votre propre signalement</Link>.
                </p>
              ) : (
                <div className="space-y-2">
                  {results.map((r) => {
                    const cfg = REPORT_TYPES[r.type as ReportTypeKey];
                    return (
                      <Link
                        key={r.id}
                        href={`/annonces/${r.id}`}
                        className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 hover:shadow-sm"
                      >
                        {r.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.photo} alt={r.title} className="h-14 w-14 rounded-xl object-cover" />
                        ) : (
                          <div className="h-14 w-14 rounded-xl bg-paper-2" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-text">{r.title}</p>
                          <p className="text-xs text-text-muted">{cfg?.label} · {r.city}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-found/10 px-3 py-1 text-sm font-bold text-found">
                          {r.score}%
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
