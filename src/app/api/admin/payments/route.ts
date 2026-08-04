import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
    take: 200,
  });

  const totalByCurrency: Record<string, number> = {};
  for (const p of payments) {
    if (p.status !== "PAYE") continue;
    totalByCurrency[p.currency] = (totalByCurrency[p.currency] ?? 0) + p.amount;
  }

  return NextResponse.json({ payments, totalByCurrency });
}
