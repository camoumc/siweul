import { prisma } from "@/lib/prisma";
import { THRESHOLD_BADGES, getBadge } from "@/lib/badges";

/**
 * Attribue des points à un utilisateur, et débloque automatiquement les
 * badges à seuil (Ambassadeur Bronze/Argent/Or) si le nouveau total les
 * atteint. Envoie une notification pour chaque nouveau badge.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- paramètre conservé pour un futur journal d'activité
export async function awardPoints(userId: string, amount: number, reason: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { points: { increment: amount } },
  });

  for (const badge of THRESHOLD_BADGES) {
    if (user.points >= (badge.threshold ?? Infinity)) {
      await awardBadge(userId, badge.key);
    }
  }

  return user;
}

/**
 * Débloque un badge précis pour un utilisateur (idempotent : ne le donne
 * qu'une seule fois) et notifie l'utilisateur.
 */
export async function awardBadge(userId: string, badgeKey: string) {
  const def = getBadge(badgeKey);
  if (!def) return;

  const existing = await prisma.userBadge.findUnique({
    where: { userId_badgeKey: { userId, badgeKey } },
  });
  if (existing) return;

  await prisma.userBadge.create({ data: { userId, badgeKey } });
  await prisma.notification.create({
    data: {
      userId,
      type: "SYSTEME",
      title: `Nouveau badge débloqué : ${def.label}`,
      body: def.description,
      link: "/tableau-de-bord",
    },
  });
}
