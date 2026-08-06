import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { notifyUser } from "@/lib/notify";

// Marque tous les gains "VALIDE" (non encore versés) d'un ambassadeur comme
// "VERSE" — à utiliser une fois le virement Wave/Orange Money/espèces
// effectué manuellement en dehors de SIWEUL.
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { ambassadorId } = await req.json();
  if (!ambassadorId) return NextResponse.json({ error: "ambassadorId requis." }, { status: 400 });

  const pending = await prisma.ambassadorEarning.findMany({
    where: { ambassadorId, status: "VALIDE" },
  });
  const total = pending.reduce((sum, e) => sum + e.amount, 0);
  if (total === 0) {
    return NextResponse.json({ error: "Aucun gain en attente de versement." }, { status: 400 });
  }

  await prisma.ambassadorEarning.updateMany({
    where: { ambassadorId, status: "VALIDE" },
    data: { status: "VERSE" },
  });
  const ambassador = await prisma.ambassador.update({
    where: { id: ambassadorId },
    data: { totalPaidOut: { increment: total } },
  });

  await notifyUser({
    userId: ambassador.userId,
    type: "SYSTEME",
    title: `${total} FCFA versés`,
    body: "Votre versement de commissions Ambassadeur a été marqué comme effectué.",
    link: "/ambassadeur",
    email: true,
  });

  return NextResponse.json({ ok: true, total });
}
