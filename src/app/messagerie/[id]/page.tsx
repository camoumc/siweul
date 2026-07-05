import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ChatBox from "@/components/ChatBox";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/connexion?callbackUrl=/messagerie/${id}`);

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      report: { select: { id: true, title: true } },
      participants: true,
    },
  });

  if (!conversation) notFound();
  const isParticipant = conversation.participants.some((p) => p.userId === session.user.id);
  if (!isParticipant) redirect("/tableau-de-bord");

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/tableau-de-bord" className="flex items-center gap-1 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={14} /> Retour
      </Link>
      <h1 className="mt-3 font-display text-2xl font-semibold text-text">
        À propos de : {conversation.report.title}
      </h1>
      <div className="mt-6">
        <ChatBox conversationId={id} />
      </div>
    </div>
  );
}
