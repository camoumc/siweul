import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notify";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ claimId: string }> }
) {
  const { claimId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { status } = await req.json();
  if (!["CONFIRME", "REJETE"].includes(status)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const claim = await prisma.ownershipClaim.findUnique({
    where: { id: claimId },
    include: { report: true },
  });
  if (!claim) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  if (claim.report.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const updated = await prisma.ownershipClaim.update({ where: { id: claimId }, data: { status } });

  await notifyUser({
    userId: claim.claimantId,
    type: "SYSTEME",
    title: status === "CONFIRME" ? "Votre réclamation a été acceptée" : "Votre réclamation a été rejetée",
    body:
      status === "CONFIRME"
        ? `Le déclarant de "${claim.report.title}" a confirmé votre demande. Contactez-le pour organiser la remise.`
        : `Le déclarant de "${claim.report.title}" n'a pas retenu votre demande.`,
    link: `/annonces/${claim.reportId}`,
    email: true,
  });

  return NextResponse.json(updated);
}
