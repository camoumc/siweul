"use client";

import { useState, useRef, useEffect } from "react";
import { Languages } from "lucide-react";
import { SUPPORTED_LOCALES, LOCALE_LABELS } from "@/i18n/config";
import { useLocale } from "@/components/LocaleProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
        aria-label="Changer de langue"
      >
        <Languages size={16} />
        <span className="hidden sm:inline">{locale.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-border bg-white p-1.5 shadow-xl">
          {SUPPORTED_LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${
                l === locale ? "bg-paper-2 font-semibold text-text" : "text-text-muted hover:bg-paper-2"
              }`}
            >
              {LOCALE_LABELS[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
