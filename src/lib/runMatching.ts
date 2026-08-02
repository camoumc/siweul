import { prisma } from "@/lib/prisma";
import { computeMatchScore, OPPOSITE_TYPE, MATCH_THRESHOLD } from "@/lib/matching";
import type { ReportType } from "@prisma/client";

/**
 * Cherche des correspondances pour un signalement fraîchement créé,
 * calcule le score de similarité avec les candidats pertinents,
 * enregistre les scores, et notifie les deux propriétaires si le score
 * dépasse le seuil MATCH_THRESHOLD.
 */
export async function runMatchingForReport(reportId: string) {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return;

  const oppositeType = OPPOSITE_TYPE[report.type] as ReportType | undefined;
  if (!oppositeType) return;

  // On limite les candidats : même type opposé, statut actif, même ville,
  // et fenêtre de 45 jours autour de la date de l'évènement.
  const dateMin = new Date(report.eventDate);
  dateMin.setDate(dateMin.getDate() - 45);
  const dateMax = new Date(report.eventDate);
  dateMax.setDate(dateMax.getDate() + 45);

  const candidates = await prisma.report.findMany({
    where: {
      type: oppositeType,
      status: "ACTIVE",
      city: report.city,
      eventDate: { gte: dateMin, lte: dateMax },
      id: { not: report.id },
      ownerId: { not: report.ownerId },
    },
    take: 100,
  });

  for (const candidate of candidates) {
    const { score, reasons } = computeMatchScore(report, candidate);
    if (score < 30) continue;

    const [reportAId, reportBId] =
      report.id < candidate.id ? [report.id, candidate.id] : [candidate.id, report.id];

    const existing = await prisma.matchScore.upsert({
      where: { reportAId_reportBId: { reportAId, reportBId } },
      update: { score, reasons: reasons.join(" • ") },
      create: { reportAId, reportBId, score, reasons: reasons.join(" • ") },
    });

    if (score >= MATCH_THRESHOLD && !existing.notified) {
      await prisma.notification.createMany({
        data: [
          {
            userId: report.ownerId,
            type: "MATCH_TROUVE",
            title: `Correspondance à ${score}% trouvée !`,
            body: `Votre signalement "${report.title}" correspond peut-être à "${candidate.title}".`,
            link: `/annonces/${candidate.id}`,
          },
          {
            userId: candidate.ownerId,
            type: "MATCH_TROUVE",
            title: `Correspondance à ${score}% trouvée !`,
            body: `Votre signalement "${candidate.title}" correspond peut-être à "${report.title}".`,
            link: `/annonces/${report.id}`,
          },
        ],
      });
      await prisma.matchScore.update({
        where: { reportAId_reportBId: { reportAId, reportBId } },
        data: { notified: true },
      });
    }
  }
}
