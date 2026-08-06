import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 30;

async function assertParticipant(conversationId: string, userId: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  return !!participant;
}

// Pagination par curseur : on charge toujours les PAGE_SIZE messages les plus
// récents en premier (chargement rapide même avec un historique de milliers
// de messages), puis ?before=<messageId> pour remonter dans l'historique.
export async function GET(
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

  const { searchParams } = new URL(req.url);
  const before = searchParams.get("before");

  let cursorDate: Date | undefined;
  if (before) {
    const cursorMsg = await prisma.message.findUnique({ where: { id: before } });
    cursorDate = cursorMsg?.createdAt;
  }

  const page = await prisma.message.findMany({
    where: {
      conversationId: id,
      ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
    },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });

  // On marque comme lus les messages reçus (pas les nôtres) affichés dans
  // cette première page.
  if (!before) {
    await prisma.message.updateMany({
      where: { conversationId: id, senderId: { not: session.user.id }, readAt: null },
      data: { readAt: new Date() },
    });
  }

  const hasMore = page.length === PAGE_SIZE;

  return NextResponse.json({
    messages: page.reverse(), // ordre chronologique croissant pour l'affichage
    hasMore,
    nextCursor: hasMore ? page[page.length - 1].id : null,
  });
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
  if (content.length > 2000) {
    return NextResponse.json({ error: "Message trop long (2000 caractères max)." }, { status: 400 });
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
