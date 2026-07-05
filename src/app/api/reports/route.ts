import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validators";
import { runMatchingForReport } from "@/lib/runMatching";
import type { Prisma, ReportType } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );
  }

  const { photos, eventDate, ...rest } = parsed.data;

  const report = await prisma.report.create({
    data: {
      ...rest,
      eventDate: new Date(eventDate),
      ownerId: session.user.id,
      photos: photos?.length
        ? { create: photos.map((url) => ({ url })) }
        : undefined,
    },
    include: { photos: true },
  });

  // Récompense de points (gamification) pour l'engagement communautaire
  await prisma.user.update({
    where: { id: session.user.id },
    data: { points: { increment: 10 } },
  });

  // Lancement du moteur de correspondance IA (asynchrone, ne bloque pas la réponse)
  runMatchingForReport(report.id).catch((e) => console.error("Matching error:", e));

  return NextResponse.json(report, { status: 201 });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const type = searchParams.get("type") as ReportType | null;
  const city = searchParams.get("city");
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = 20;

  const where: Prisma.ReportWhereInput = {
    status: (status as Prisma.ReportWhereInput["status"]) ?? "ACTIVE",
  };
  if (type) where.type = type;
  if (city) where.city = city;
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: { photos: true, owner: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.report.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}
