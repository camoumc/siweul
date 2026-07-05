import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function assertParticipant(conversationId: string, userId: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  return !!participant;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  if (!(await assertParticipant(id, session.user.id))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  if (!(await assertParticipant(id, session.user.id))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const { content } = await req.json();
  if (!content || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }

  // Filtre basique anti-partage de numéro de téléphone dans le texte,
  // conformément à la règle "aucun numéro visible hors messagerie interne"
  const sanitized = content.replace(/(\+?\d[\d\s.-]{6,}\d)/g, "[numéro masqué]");

  const message = await prisma.message.create({
    data: { conversationId: id, senderId: session.user.id, content: sanitized },
    include: { sender: { select: { id: true, name: true } } },
  });

  const otherParticipants = await prisma.conversationParticipant.findMany({
    where: { conversationId: id, userId: { not: session.user.id } },
  });
  await prisma.notification.createMany({
    data: otherParticipants.map((p) => ({
      userId: p.userId,
      type: "NOUVEAU_MESSAGE" as const,
      title: "Nouveau message",
      body: sanitized.slice(0, 80),
      link: `/messagerie/${id}`,
    })),
  });

  return NextResponse.json(message, { status: 201 });
}
