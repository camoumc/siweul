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
  });
}
