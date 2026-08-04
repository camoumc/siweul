"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Users2, CheckCircle2, FileText, ShieldCheck, UserPlus, X } from "lucide-react";
import { REPORT_TYPES, type ReportTypeKey } from "@/lib/reportConfig";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface OrgReport {
  id: string;
  title: string;
  type: string;
  status: string;
  city: string;
  createdAt: string;
  owner: { name: string };
}

interface OrgData {
  id: string;
  name: string;
  type: string;
  isVerified: boolean;
  isOwner: boolean;
  owner: { name: string; email: string };
  members: Member[];
  reports: OrgReport[];
  stats: { totalReports: number; resolvedCount: number; memberCount: number };
}

export default function OrgDashboard({ org }: { org: OrgData }) {
  const [members, setMembers] = useState(org.members);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError("");
    const res = await fetch("/api/organizations/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) {
      setError(data.error ?? "Erreur");
      return;
    }
    setMembers((m) => [...m, { id: data.id ?? Math.random().toString(), name: email, email, role: "MEMBRE" }]);
    setEmail("");
  };

  const removeMember = async (userId: string) => {
    await fetch("/api/organizations/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setMembers((m) => m.filter((x) => x.id !== userId));
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white">
          <Building2 size={22} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">{org.name}</h1>
          <p className="text-sm text-text-muted">{org.type}</p>
        </div>
        {org.isVerified ? (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-found/10 px-3 py-1 text-xs font-semibold text-found">
            <ShieldCheck size={13} /> Organisation vérifiée
          </span>
        ) : (
          <span className="ml-auto rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
            Vérification en attente
          </span>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5">
          <FileText className="text-signal" size={20} />
          <p className="mt-2 font-display text-2xl font-semibold text-text">{org.stats.totalReports}</p>
          <p className="text-xs text-text-muted">Signalements publiés</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <CheckCircle2 className="text-found" size={20} />
          <p className="mt-2 font-display text-2xl font-semibold text-text">{org.stats.resolvedCount}</p>
          <p className="text-xs text-text-muted">Résolus</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <Users2 className="text-gold" size={20} />
          <p className="mt-2 font-display text-2xl font-semibold text-text">{org.stats.memberCount + 1}</p>
          <p className="text-xs text-text-muted">Membres de l&apos;équipe</p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-text">Signalements de l&apos;organisation</h2>
            <Link href="/signaler" className="text-sm font-semibold text-signal">
              + Nouveau signalement
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {org.reports.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
                Aucun signalement publié pour l&apos;instant. Cochez &laquo; Publier au nom de mon
                organisation &raquo; lors de la création d&apos;un signalement pour qu&apos;il apparaisse ici.
              </p>
            )}
            {org.reports.map((r) => {
              const cfg = REPORT_TYPES[r.type as ReportTypeKey];
              return (
                <Link
                  key={r.id}
                  href={`/annonces/${r.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 hover:shadow-sm"
                >
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${cfg.bg} ${cfg.color}`}>
                    {cfg.shortLabel}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text">{r.title}</p>
                    <p className="text-xs text-text-muted">{r.city} · par {r.owner.name}</p>
                  </div>
                  <span className="shrink-0 text-xs text-text-muted">
                    {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-text">Équipe</h2>
          <div className="mt-4 space-y-2 rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center justify-between rounded-xl bg-paper-2 px-3 py-2 text-sm">
              <span className="font-medium text-text">{org.owner.name}</span>
              <span className="text-xs text-text-muted">Propriétaire</span>
            </div>
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="text-text">{m.name || m.email}</span>
                {org.isOwner && (
                  <button onClick={() => removeMember(m.id)} className="text-text-muted hover:text-alert">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}

            {org.isOwner && (
              <form onSubmit={addMember} className="mt-2 flex gap-2 border-t border-border pt-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@collegue.com"
                  className="min-w-0 flex-1 rounded-lg border border-border px-2 py-1.5 text-xs outline-none focus:border-signal"
                />
                <button
                  type="submit"
                  disabled={adding}
                  className="flex items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                  <UserPlus size={13} /> Ajouter
                </button>
              </form>
            )}
            {error && <p className="text-xs text-alert">{error}</p>}
            <p className="pt-1 text-[11px] text-text-muted">
              La personne doit déjà avoir un compte SIWEUL avec cet email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
