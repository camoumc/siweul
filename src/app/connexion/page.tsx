"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push(params.get("callbackUrl") ?? "/tableau-de-bord");
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-badge.png" alt="SIWEUL" className="mx-auto h-14 w-14" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-text">Content de vous revoir</h1>
        <p className="mt-1 text-sm text-text-muted">Connectez-vous à votre espace SIWEUL.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border bg-white p-6 shadow-sm">
        {error && (
          <p className="rounded-xl bg-alert/10 px-3 py-2 text-sm text-alert">{error}</p>
        )}
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
        <div>
          <label className="text-sm font-medium text-text">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-signal px-4 py-2.5 font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
        >
          <LogIn size={16} /> {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-semibold text-signal">
          Inscrivez-vous
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
