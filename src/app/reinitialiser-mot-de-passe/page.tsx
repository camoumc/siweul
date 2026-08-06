"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/connexion"), 2500);
  };

  if (!token) {
    return (
      <div className="rounded-3xl border border-border bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-alert">
          Lien invalide. Redemandez une réinitialisation depuis la page{" "}
          <Link href="/mot-de-passe-oublie" className="font-semibold underline">
            Mot de passe oublié
          </Link>
          .
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-border bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto text-found" size={28} />
        <p className="mt-2 text-sm text-text">
          Mot de passe réinitialisé avec succès. Redirection vers la connexion...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border bg-white p-6 shadow-sm">
      {error && <p className="rounded-xl bg-alert/10 px-3 py-2 text-sm text-alert">{error}</p>}
      <div>
        <label className="text-sm font-medium text-text">Nouveau mot de passe</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-text">Confirmer le mot de passe</label>
        <input
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-signal px-4 py-2.5 font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Enregistrement..." : "Réinitialiser le mot de passe"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-8 text-center">
        <KeyRound className="mx-auto text-signal" size={32} />
        <h1 className="mt-4 font-display text-2xl font-semibold text-text">Nouveau mot de passe</h1>
      </div>
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  );
}
