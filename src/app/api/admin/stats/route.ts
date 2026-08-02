import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { REPORT_TYPE_ORDER } from "@/lib/reportConfig";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const [totalUsers, totalReports, resolvedReports, byType, last30days] = await Promise.all([
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
    prisma.report.groupBy({
      by: ["createdAt"],
      _count: true,
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const successRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

  // Regroupement par jour pour le graphique (30 derniers jours)
  const dailyMap = new Map<string, number>();
  for (const row of last30days) {
    const day = new Date(row.createdAt).toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + row._count);
  }
  const dailySeries = Array.from(dailyMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    totalUsers,
    totalReports,
    resolvedReports,
    successRate,
    byType,
    dailySeries,
  });
}
