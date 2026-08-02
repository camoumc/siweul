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
import { Users, FileWarning, CheckCircle2, TrendingUp } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalReports: number;
  resolvedReports: number;
  successRate: number;
  byType: { type: string; total: number; resolved: number }[];
  dailySeries: { date: string; count: number }[];
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
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-text">Vue d&apos;ensemble</h1>
      <p className="mt-1 text-text-muted">Suivi en temps réel de l&apos;activité SIWEUL.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
            Signalements (30 derniers jours)
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats.dailySeries}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f2762e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f2762e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e2d3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
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
      </div>
    </div>
  );
}
