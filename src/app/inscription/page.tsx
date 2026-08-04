"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { SENEGAL_CITIES } from "@/lib/reportConfig";
import { useLocale } from "@/components/LocaleProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { dict } = useLocale();
  const a = dict.auth;
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", city: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    router.push("/tableau-de-bord");
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-badge.png" alt="SIWEUL" className="mx-auto h-14 w-14" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-text">{a.registerTitle}</h1>
        <p className="mt-1 text-sm text-text-muted">{a.registerSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border bg-white p-6 shadow-sm">
        {error && <p className="rounded-xl bg-alert/10 px-3 py-2 text-sm text-alert">{error}</p>}
        <div>
          <label className="text-sm font-medium text-text">{a.fullName}</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-text">{a.email}</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-text">{a.phone}</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
              placeholder="77 000 00 00"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text">{a.city}</label>
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
            >
              <option value="">—</option>
              {SENEGAL_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-text">{a.password}</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-signal focus:ring-2 focus:ring-signal/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-signal px-4 py-2.5 font-semibold text-white hover:bg-signal-dark disabled:opacity-60"
        >
          <UserPlus size={16} /> {loading ? a.registerLoading : a.registerButton}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        {a.alreadyRegistered}{" "}
        <Link href="/connexion" className="font-semibold text-signal">
          {a.loginLink}
        </Link>
      </p>
    </div>
  );
}
