import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Crée (ou récupère) la conversation entre l'utilisateur courant et le
// propriétaire d'un signalement, pour permettre une messagerie sécurisée
// sans jamais exposer de numéro de téléphone.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { reportId } = await req.json();
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  if (report.ownerId === session.user.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas démarrer une conversation avec vous-même." },
      { status: 400 }
    );
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      reportId,
      participants: {
        some: { userId: session.user.id },
      },
    },
    include: { participants: true },
  });

  if (existing) return NextResponse.json(existing);

  const conversation = await prisma.conversation.create({
    data: {
      reportId,
      participants: {
        create: [{ userId: session.user.id }, { userId: report.ownerId }],
      },
    },
    include: { participants: true },
  });

  return NextResponse.json(conversation, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: session.user.id } } },
    include: {
      report: { select: { id: true, title: true, type: true } },
      participants: { include: { user: { select: { id: true, name: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(conversations);
}
