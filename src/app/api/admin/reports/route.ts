import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");

  const where: Prisma.ReportWhereInput = {};
  if (status) where.status = status as Prisma.ReportWhereInput["status"];
  if (type) where.type = type as Prisma.ReportWhereInput["type"];

  const reports = await prisma.report.findMany({
    where,
    include: { owner: { select: { name: true, email: true } }, photos: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(reports);
}
