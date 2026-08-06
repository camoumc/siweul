import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notify";

/**
 * Attribue un gain à un ambassadeur ACTIF pour une action valide (ex :
 * signalement résolu qu'il a publié ou aidé à résoudre). Idempotent par
 * (ambassadorId, reason, reportId) pour éviter les doublons si la fonction
 * est appelée plusieurs fois pour le même évènement.
 */
export async function awardAmbassadorEarning(
  userId: string,
  reason: string,
  reportId?: string
) {
  const ambassador = await prisma.ambassador.findUnique({ where: { userId } });
  if (!ambassador || ambassador.status !== "ACTIF") return;

  if (reportId) {
    const existing = await prisma.ambassadorEarning.findFirst({
      where: { ambassadorId: ambassador.id, reportId, reason },
    });
    if (existing) return;
  }

  const amount = ambassador.commissionRate;

  await prisma.ambassadorEarning.create({
    data: { ambassadorId: ambassador.id, amount, reason, reportId },
  });
  await prisma.ambassador.update({
    where: { id: ambassador.id },
    data: { totalEarned: { increment: amount } },
  });
  await notifyUser({
    userId,
    type: "SYSTEME",
    title: `+${amount} FCFA — gain Ambassadeur`,
    body: reason,
    link: "/ambassadeur",
    email: true,
  });
}
