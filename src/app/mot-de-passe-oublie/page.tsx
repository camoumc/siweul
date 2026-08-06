"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-8 text-center">
        <KeyRound className="mx-auto text-signal" size={32} />
        <h1 className="mt-4 font-display text-2xl font-semibold text-text">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-text-muted">
          Indiquez votre email, nous vous enverrons un lien de réinitialisation.
        </p>
      </div>

      {sent ? (
        <div className="rounded-3xl border border-border bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-text">
            Si un compte existe avec l&apos;adresse <strong>{email}</strong>, un email
            contenant un lien de réinitialisation vient d&apos;être envoyé. Vérifiez aussi
            vos courriers indésirables.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border bg-white p-6 shadow-sm">
          {error && <p className="rounded-xl bg-alert/10 px-3 py-2 text-sm text-alert">{error}</p>}
          <div>
            <label className="text-sm font-medium text-text">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
              placeholder="vous@exemple.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-signal px-4 py-2.5 font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>
      )}

      <Link href="/connexion" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-signal">
        <ArrowLeft size={14} /> Retour à la connexion
      </Link>
    </div>
  );
}
