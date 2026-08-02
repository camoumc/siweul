"use client";

import { useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";

export default function PhotoUploader({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    const newUrls: string[] = [];
    for (const file of Array.from(files).slice(0, 6 - urls.length)) {
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (res.ok) newUrls.push(data.url);
        else setError(data.error ?? "Échec de l'upload");
      } catch {
        setError("Échec de l'upload");
      }
    }
    onChange([...urls, ...newUrls]);
    setUploading(false);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {urls.map((url) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Photo du signalement" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(urls.filter((u) => u !== url))}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {urls.length < 6 && (
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-text-muted hover:border-signal hover:text-signal">
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
            <span className="text-[10px]">Ajouter</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-alert">{error}</p>}
      <p className="mt-2 text-xs text-text-muted">Jusqu&apos;à 6 photos, 8 Mo max chacune.</p>
    </div>
  );
}
