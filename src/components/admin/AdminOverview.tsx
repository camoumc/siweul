"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { REPORT_TYPES, type ReportTypeKey } from "@/lib/reportConfig";
import { Users, FileWarning, CheckCircle2, TrendingUp, Clock, Download } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalReports: number;
  resolvedReports: number;
  successRate: number;
  avgResolutionDays: number | null;
  byType: { type: string; total: number; resolved: number }[];
  monthlySeries: { month: string; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
  cityBreakdown: { city: string; total: number; resolved: number }[];
}

function monthLabel(ym: string) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("fr-FR", {
    month: "short",
    year: "2-digit",
  });
}

function downloadCsv(stats: Stats) {
  const lines: string[] = [];
  lines.push("Rapport statistique SIWEUL");
  lines.push(`Genere le,${new Date().toLocaleDateString("fr-FR")}`);
  lines.push("");
  lines.push("Indicateur,Valeur");
  lines.push(`Utilisateurs,${stats.totalUsers}`);
  lines.push(`Signalements totaux,${stats.totalReports}`);
  lines.push(`Resolus,${stats.resolvedReports}`);
  lines.push(`Taux de reussite,${stats.successRate}%`);
  lines.push(`Temps moyen de resolution (jours),${stats.avgResolutionDays ?? "N/A"}`);
  lines.push("");
  lines.push("Par module,Total,Resolus");
  for (const t of stats.byType) {
    lines.push(`${REPORT_TYPES[t.type as ReportTypeKey]?.label ?? t.type},${t.total},${t.resolved}`);
  }
  lines.push("");
  lines.push("Par ville,Total,Resolus");
  for (const c of stats.cityBreakdown) {
    lines.push(`${c.city},${c.total},${c.resolved}`);
  }
  lines.push("");
  lines.push("Categories les plus signalees,Nombre");
  for (const c of stats.categoryBreakdown) {
    lines.push(`${c.category},${c.count}`);
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `siweul-rapport-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-paper-2" />;
  }
  if (!stats) {
    return <p className="text-text-muted">Impossible de charger les statistiques.</p>;
  }

  const cards = [
    { label: "Utilisateurs", value: stats.totalUsers, icon: Users, color: "text-signal" },
    { label: "Signalements", value: stats.totalReports, icon: FileWarning, color: "text-ink" },
    { label: "Résolus", value: stats.resolvedReports, icon: CheckCircle2, color: "text-found" },
    { label: "Taux de réussite", value: `${stats.successRate}%`, icon: TrendingUp, color: "text-gold" },
    {
      label: "Délai moyen de résolution",
      value: stats.avgResolutionDays !== null ? `${stats.avgResolutionDays} j` : "—",
      icon: Clock,
      color: "text-signal-dark",
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-text">Vue d&apos;ensemble</h1>
          <p className="mt-1 text-text-muted">Suivi en temps réel de l&apos;activité SIWEUL.</p>
        </div>
        <button
          onClick={() => downloadCsv(stats)}
          className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink-2"
        >
          <Download size={14} /> Exporter le rapport (CSV)
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-white p-5">
            <c.icon className={c.color} size={20} />
            <p className="mt-3 font-display text-2xl font-semibold text-text">{c.value}</p>
            <p className="text-xs text-text-muted">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-text">
            Évolution mensuelle (12 derniers mois)
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats.monthlySeries.map((m) => ({ ...m, label: monthLabel(m.month) }))}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f2762e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f2762e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e2d3" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#f2762e" fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-text">Répartition par module</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={stats.byType.map((t) => ({
                name: REPORT_TYPES[t.type as ReportTypeKey]?.shortLabel ?? t.type,
                Total: t.total,
                Résolus: t.resolved,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e2d3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="Total" fill="#14173a" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Résolus" fill="#0e7263" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-text">
            Catégories les plus signalées
          </h2>
          {stats.categoryBreakdown.length === 0 ? (
            <p className="text-sm text-text-muted">Pas encore de données.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.categoryBreakdown} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e2d3" />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={110} />
                <Tooltip />
                <Bar dataKey="count" name="Signalements" fill="#f2762e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-4 font-display text-base font-semibold text-text">
            Zones les plus actives
          </h2>
          <div className="space-y-2">
            {stats.cityBreakdown.map((c) => (
              <div key={c.city} className="flex items-center justify-between rounded-xl bg-paper-2 px-3 py-2 text-sm">
                <span className="font-medium text-text">{c.city}</span>
                <span className="text-text-muted">
                  {c.total} signalements · <span className="text-found">{c.resolved} résolus</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
