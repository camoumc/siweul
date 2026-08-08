import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computeOwnershipScore } from "@/lib/ownershipVerification";
import { notifyUser } from "@/lib/notify";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { providedDetail } = await req.json();
  if (!providedDetail || typeof providedDetail !== "string" || providedDetail.trim().length < 3) {
    return NextResponse.json({ error: "Merci de fournir une description ou preuve détaillée." }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  if (report.ownerId === session.user.id) {
    return NextResponse.json({ error: "Vous êtes le déclarant de cette annonce." }, { status: 400 });
  }

  const { score, label, reasons } = computeOwnershipScore({
    providedDetail,
    hiddenDetail: report.hiddenDetail,
    serialOrVin: report.serialOrVin,
  });

  const status = score >= 85 ? "CONFIRME" : score >= 50 ? "EN_ATTENTE" : "INSUFFISANT";

  const claim = await prisma.ownershipClaim.create({
    data: {
      reportId: id,
      claimantId: session.user.id,
      providedDetail: providedDetail.trim(),
      score,
      status,
    },
  });

  // Le trouveur (déclarant de l'annonce) est notifié pour valider manuellement
  // — le score est une aide à la décision, pas une autorité automatique de
  // restitution.
  await notifyUser({
    userId: report.ownerId,
    type: "SYSTEME",
    title: `Réclamation reçue (${score}% — ${label})`,
    body: `Quelqu'un affirme être le propriétaire de "${report.title}". Vérifiez sa demande avant toute remise.`,
    link: `/annonces/${id}`,
    email: true,
  });

  return NextResponse.json({ score, label, reasons, claimId: claim.id }, { status: 201 });
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

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  // Seul le déclarant (trouveur) voit la liste des réclamations reçues.
  if (report.ownerId !== session.user.id) {
    return NextResponse.json([]);
  }

  const claims = await prisma.ownershipClaim.findMany({
    where: { reportId: id },
    include: { claimant: { select: { name: true, email: true, isVerified: true } } },
    orderBy: { score: "desc" },
  });

  return NextResponse.json(claims);
}
