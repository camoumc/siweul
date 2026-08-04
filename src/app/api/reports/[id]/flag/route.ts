import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { reason } = await req.json();
  if (!reason || typeof reason !== "string" || reason.trim().length < 5) {
    return NextResponse.json({ error: "Merci de préciser la raison (5 caractères min)." }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await prisma.reportFlag.create({
    data: { reportId: id, reporterId: session.user.id, reason: reason.trim() },
  });

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true },
  });
  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type: "SYSTEME" as const,
      title: "Annonce signalée",
      body: `"${report.title}" a été signalée : ${reason.trim().slice(0, 100)}`,
      link: "/admin/moderation",
    })),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
