import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { awardPoints, awardBadge } from "@/lib/points";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      photos: true,
      owner: { select: { id: true, name: true, isVerified: true, createdAt: true } },
    },
  });
  if (!report) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(report);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const isOwner = report.ownerId === session.user.id;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const body = await req.json();
  const allowedFields = ["status", "title", "description"] as const;
  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) data[field] = body[field];
  }

  const updated = await prisma.report.update({ where: { id }, data });

  // Si le signalement vient d'être marqué résolu, on récompense le
  // déclarant et toute personne ayant participé à une conversation liée
  // (celle qui a probablement aidé à retrouver l'objet/la personne).
  if (data.status === "RESOLU" && report.status !== "RESOLU") {
    await awardPoints(report.ownerId, 20, "Signalement résolu");

    const helpers = await prisma.conversationParticipant.findMany({
      where: { conversation: { reportId: id }, userId: { not: report.ownerId } },
      select: { userId: true },
      distinct: ["userId"],
    });
    for (const h of helpers) {
      await awardPoints(h.userId, 30, "A aidé à résoudre un signalement");
      await awardBadge(h.userId, "AIDANT");
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const isOwner = report.ownerId === session.user.id;
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  await prisma.report.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
