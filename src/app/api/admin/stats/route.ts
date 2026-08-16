import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { REPORT_TYPE_ORDER } from "@/lib/reportConfig";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const [
    totalUsers,
    totalReports,
    resolvedReports,
    byType,
    last365days,
    resolvedWithDates,
    categoryRows,
    cityRows,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.report.count(),
    prisma.report.count({ where: { status: "RESOLU" } }),
    Promise.all(
      REPORT_TYPE_ORDER.map(async (type) => ({
        type,
        total: await prisma.report.count({ where: { type } }),
        resolved: await prisma.report.count({ where: { type, status: "RESOLU" } }),
      }))
    ),
    prisma.report.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true },
    }),
    prisma.report.findMany({
      where: { status: "RESOLU" },
      select: { createdAt: true, updatedAt: true },
    }),
    prisma.report.groupBy({
      by: ["category"],
      _count: { category: true },
      where: { category: { not: null } },
      orderBy: { _count: { category: "desc" } },
      take: 8,
    }),
    prisma.report.groupBy({
      by: ["city"],
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 10,
    }),
  ]);

  const successRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

  // Evolution mensuelle (12 derniers mois)
  const monthlyMap = new Map<string, number>();
  for (const r of last365days) {
    const month = r.createdAt.toISOString().slice(0, 7); // YYYY-MM
    monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + 1);
  }
  const monthlySeries = Array.from(monthlyMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Prevision du mois prochain par regression lineaire simple sur les 6
  // derniers mois (methode des moindres carres) — une projection
  // statistique transparente, pas un modele "boite noire".
  const recentMonths = monthlySeries.slice(-6);
  let forecastNextMonth: number | null = null;
  if (recentMonths.length >= 3) {
    const n = recentMonths.length;
    const xs = recentMonths.map((_, i) => i);
    const ys = recentMonths.map((m) => m.count);
    const xMean = xs.reduce((a, b) => a + b, 0) / n;
    const yMean = ys.reduce((a, b) => a + b, 0) / n;
    const num = xs.reduce((sum, x, i) => sum + (x - xMean) * (ys[i] - yMean), 0);
    const den = xs.reduce((sum, x) => sum + (x - xMean) ** 2, 0);
    const slope = den !== 0 ? num / den : 0;
    const intercept = yMean - slope * xMean;
    forecastNextMonth = Math.max(0, Math.round(intercept + slope * n));
  }

  // Tendance par categorie : 30 derniers jours vs 30 jours precedents
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const d60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const categoryTrends = await Promise.all(
    categoryRows.slice(0, 6).map(async (r) => {
      const [recent, previous] = await Promise.all([
        prisma.report.count({ where: { category: r.category, createdAt: { gte: d30 } } }),
        prisma.report.count({ where: { category: r.category, createdAt: { gte: d60, lt: d30 } } }),
      ]);
      let trend: "hausse" | "stable" | "baisse" = "stable";
      if (previous === 0 && recent > 0) trend = "hausse";
      else if (previous > 0) {
        const change = (recent - previous) / previous;
        if (change > 0.15) trend = "hausse";
        else if (change < -0.15) trend = "baisse";
      }
      return { category: r.category ?? "Autre", recent, previous, trend };
    })
  );

  // Temps moyen entre déclaration et résolution
  let avgResolutionDays: number | null = null;
  if (resolvedWithDates.length > 0) {
    const totalMs = resolvedWithDates.reduce(
      (sum, r) => sum + (r.updatedAt.getTime() - r.createdAt.getTime()),
      0
    );
    avgResolutionDays = Math.round((totalMs / resolvedWithDates.length / (1000 * 60 * 60 * 24)) * 10) / 10;
  }

  const categoryBreakdown = categoryRows.map((r) => ({
    category: r.category ?? "Autre",
    count: r._count.category,
  }));

  const cityBreakdown = await Promise.all(
    cityRows.map(async (r) => ({
      city: r.city,
      total: r._count.city,
      resolved: await prisma.report.count({ where: { city: r.city, status: "RESOLU" } }),
    }))
  );

  return NextResponse.json({
    totalUsers,
    totalReports,
    resolvedReports,
    successRate,
    avgResolutionDays,
    byType,
    monthlySeries,
    categoryBreakdown,
    cityBreakdown,
    forecastNextMonth,
    categoryTrends,
  });
}
