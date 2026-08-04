import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { REPORT_TYPES, STATUS_LABELS, type ReportTypeKey } from "@/lib/reportConfig";
import { computeTrustScore } from "@/lib/trustScore";
import { getBadge } from "@/lib/badges";
import { Trophy, PlusCircle, MessageSquare } from "lucide-react";
import ReportRowActions from "@/components/ReportRowActions";
import TrustBadge from "@/components/TrustBadge";
import BadgeIcon from "@/components/BadgeIcon";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/tableau-de-bord");

  const [user, reports, conversations, earnedBadges] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.report.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { photos: true },
    }),
    prisma.conversation.findMany({
      where: { participants: { some: { userId: session.user.id } } },
      include: {
        report: { select: { title: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.userBadge.findMany({ where: { userId: session.user.id } }),
  ]);

  const activeCount = reports.filter((r) => r.status === "ACTIVE").length;
  const resolvedCount = reports.filter((r) => r.status === "RESOLU").length;
  const accountAgeDays = user
    ? // eslint-disable-next-line react-hooks/purity -- calcul serveur (Server Component), pas de rendu React concerné
      Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const trustScore = computeTrustScore({
    points: user?.points ?? 0,
    isVerified: user?.isVerified ?? false,
    accountAgeDays,
    resolvedReportsCount: resolvedCount,
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-signal">Mon espace</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-text">
            Bonjour, {user?.name?.split(" ")[0]}
          </h1>
        </div>
        <Link
          href="/signaler"
          className="flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-white hover:bg-signal-dark"
        >
          <PlusCircle size={16} /> Nouveau signalement
        </Link>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Signalements actifs", value: activeCount },
          { label: "Résolus", value: resolvedCount },
          { label: "Points", value: user?.points ?? 0 },
          { label: "Forfait", value: user?.plan ?? "GRATUIT" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-white p-5">
            <p className="font-display text-2xl font-semibold text-text">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-10 rounded-2xl border border-border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-[220px] flex-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              Score de confiance
            </p>
            <TrustBadge score={trustScore} isVerified={user?.isVerified ?? false} />
          </div>
          {earnedBadges.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {earnedBadges.map((b) => {
                const def = getBadge(b.badgeKey);
                if (!def) return null;
                return (
                  <span
                    key={b.badgeKey}
                    title={def.description}
                    className="flex items-center gap-1 rounded-full bg-paper-2 px-2.5 py-1 text-xs font-medium text-text"
                  >
                    <BadgeIcon name={def.icon} size={13} /> {def.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 font-display text-xl font-semibold text-text">Mes signalements</h2>
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-14 text-center text-text-muted">
              Vous n&apos;avez encore rien signalé.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => {
                const cfg = REPORT_TYPES[r.type as ReportTypeKey];
                return (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full ${cfg.bg} px-2.5 py-1 text-xs font-bold ${cfg.color}`}>
                        {cfg.shortLabel}
                      </span>
                      <div>
                        <Link href={`/annonces/${r.id}`} className="font-semibold text-text hover:text-signal">
                          {r.title}
                        </Link>
                        <p className="text-xs text-text-muted">
                          {STATUS_LABELS[r.status]} · {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <ReportRowActions id={r.id} status={r.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-text">
            <MessageSquare size={18} /> Messages récents
          </h2>
          {conversations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-text-muted">
              Aucune conversation.
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((c) => (
                <Link
                  key={c.id}
                  href={`/messagerie/${c.id}`}
                  className="block rounded-2xl border border-border bg-white p-4 hover:border-signal"
                >
                  <p className="text-sm font-semibold text-text line-clamp-1">{c.report.title}</p>
                  <p className="text-xs text-text-muted line-clamp-1">
                    {c.messages[0]?.content ?? "Nouvelle conversation"}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/classement"
            className="mt-6 flex items-center gap-2 rounded-2xl bg-gold/10 p-4 text-sm font-semibold text-gold hover:bg-gold/20"
          >
            <Trophy size={18} /> Voir le classement communautaire
          </Link>
        </div>
      </div>
    </div>
  );
}
