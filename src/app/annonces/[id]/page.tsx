import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { REPORT_TYPES, type ReportTypeKey } from "@/lib/reportConfig";
import { computeTrustScore } from "@/lib/trustScore";
import { MapPin, Calendar, Gift, ShieldCheck, User, Building2 } from "lucide-react";
import ContactButton from "@/components/ContactButton";
import ShareButtons from "@/components/ShareButtons";
import TrustBadge from "@/components/TrustBadge";
import BadgeIcon from "@/components/BadgeIcon";
import FlagButton from "@/components/FlagButton";
import ReportTimeline from "@/components/ReportTimeline";
import ClaimOwnershipButton from "@/components/ClaimOwnershipButton";
import OwnershipClaimsPanel from "@/components/OwnershipClaimsPanel";
import { getBadge } from "@/lib/badges";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://www.siweul.pro";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      city: true,
      type: true,
      category: true,
      photos: { take: 1, select: { url: true } },
    },
  });
  if (!report) return { title: "Annonce introuvable — SIWEUL" };

  const cfg = REPORT_TYPES[report.type as ReportTypeKey];
  const title = `${report.title} — ${cfg.label} à ${report.city} | SIWEUL`;
  const description = report.description.slice(0, 155);
  const image = report.photos[0]?.url ?? `${BASE_URL}/brand/logo-badge.png`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/annonces/${id}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/annonces/${id}`,
      images: [{ url: image }],
      siteName: "SIWEUL",
      locale: "fr_SN",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function AnnonceDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      photos: true,
      owner: {
        select: {
          id: true,
          name: true,
          isVerified: true,
          createdAt: true,
          points: true,
          badges: { select: { badgeKey: true } },
        },
      },
      organization: { select: { name: true, type: true, isVerified: true } },
    },
  });

  if (!report) notFound();

  const [resolvedReportsCount, bestMatch, conversationCount] = await Promise.all([
    prisma.report.count({ where: { ownerId: report.owner.id, status: "RESOLU" } }),
    prisma.matchScore.findFirst({
      where: { OR: [{ reportAId: report.id }, { reportBId: report.id }] },
      orderBy: { score: "desc" },
      select: { score: true },
    }),
    prisma.conversation.count({ where: { reportId: report.id } }),
  ]);
  const accountAgeDays = Math.floor(
    // eslint-disable-next-line react-hooks/purity -- calcul serveur (Server Component), pas de rendu React concerné
    (Date.now() - new Date(report.owner.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const trustScore = computeTrustScore({
    points: report.owner.points,
    isVerified: report.owner.isVerified,
    accountAgeDays,
    resolvedReportsCount,
  });

  const cfg = REPORT_TYPES[report.type as ReportTypeKey];
  const isOwner = session?.user?.id === report.ownerId;
  const url = `${BASE_URL}/annonces/${report.id}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: cfg.labelPlural, item: `${BASE_URL}/rechercher?type=${report.type}` },
          { "@type": "ListItem", position: 3, name: report.title, item: url },
        ],
      },
      {
        "@type": "Article",
        headline: report.title,
        description: report.description.slice(0, 300),
        image: report.photos[0]?.url,
        datePublished: report.createdAt.toISOString(),
        dateModified: report.updatedAt.toISOString(),
        author: { "@type": "Organization", name: "SIWEUL" },
        publisher: { "@type": "Organization", name: "SIWEUL", logo: { "@type": "ImageObject", url: `${BASE_URL}/brand/logo-badge.png` } },
        contentLocation: { "@type": "Place", name: report.city },
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className={`inline-flex rounded-full ${cfg.bg} px-3 py-1 text-xs font-bold ${cfg.color}`}>
          {cfg.shortLabel}
        </span>
        {report.status === "RESOLU" && (
          <span className="inline-flex rounded-full bg-found px-3 py-1 text-xs font-bold text-white">
            Résolu
          </span>
        )}
        {report.category && (
          <span className="text-sm text-text-muted">{report.category}</span>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {report.photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-3xl sm:grid-cols-3">
              {report.photos.map((p, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={p.url}
                  alt={report.title}
                  className={`h-48 w-full object-cover ${i === 0 ? "col-span-2 h-72 sm:col-span-2" : ""}`}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center rounded-3xl bg-paper-2 text-text-muted">
              Aucune photo fournie
            </div>
          )}

          <h1 className="mt-6 font-display text-3xl font-semibold text-text">{report.title}</h1>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-text-muted">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {report.district ? `${report.district}, ` : ""}{report.city}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {new Date(report.eventDate).toLocaleDateString("fr-FR")}
              {report.eventTime ? ` à ${report.eventTime}` : ""}
            </span>
          </div>

          <p className="mt-6 whitespace-pre-line leading-relaxed text-text">{report.description}</p>

          <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl bg-paper-2 p-5 text-sm sm:grid-cols-3">
            {report.color && (
              <div><dt className="text-text-muted">Couleur</dt><dd className="font-semibold text-text">{report.color}</dd></div>
            )}
            {report.brand && (
              <div><dt className="text-text-muted">Marque</dt><dd className="font-semibold text-text">{report.brand}</dd></div>
            )}
            {report.animalSpecies && (
              <div><dt className="text-text-muted">Espèce</dt><dd className="font-semibold text-text">{report.animalSpecies}</dd></div>
            )}
            {report.personAge != null && (
              <div><dt className="text-text-muted">Âge</dt><dd className="font-semibold text-text">{report.personAge} ans</dd></div>
            )}
            {report.clothingDesc && (
              <div className="col-span-2"><dt className="text-text-muted">Vêtements</dt><dd className="font-semibold text-text">{report.clothingDesc}</dd></div>
            )}
            {report.reward != null && report.reward > 0 && (
              <div className="flex items-center gap-1">
                <Gift size={14} className="text-gold" />
                <dd className="font-semibold text-gold">{report.reward.toLocaleString("fr-FR")} FCFA</dd>
              </div>
            )}
          </dl>

          <div className="mt-6">
            <ShareButtons title={`SIWEUL — ${report.title}`} url={url} reportId={report.id} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-2">
                <User size={18} className="text-text-muted" />
              </span>
              <div>
                <p className="font-semibold text-text">{report.contactName || report.owner.name}</p>
                <p className="text-xs text-text-muted">
                  Membre depuis {new Date(report.owner.createdAt).getFullYear()}
                </p>
              </div>
              {report.owner.isVerified && (
                <ShieldCheck size={16} className="ml-auto text-found" />
              )}
            </div>

            {report.organization && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-paper-2 px-3 py-2 text-xs">
                <Building2 size={14} className="text-signal" />
                <span className="font-semibold text-text">{report.organization.name}</span>
                <span className="text-text-muted">· {report.organization.type}</span>
                {report.organization.isVerified && <ShieldCheck size={12} className="ml-auto text-found" />}
              </div>
            )}

            <div className="mt-4">
              <TrustBadge score={trustScore} isVerified={report.owner.isVerified} />
            </div>

            {report.owner.badges.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {report.owner.badges.map((b) => {
                  const def = getBadge(b.badgeKey);
                  if (!def) return null;
                  return (
                    <span
                      key={b.badgeKey}
                      title={def.description}
                      className="flex items-center gap-1 rounded-full bg-paper-2 px-2 py-1 text-[11px] font-medium text-text"
                    >
                      <BadgeIcon name={def.icon} size={12} /> {def.label}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="mt-4">
              <ContactButton reportId={report.id} isOwner={isOwner} />
            </div>

            {!isOwner && (
              <div className="mt-3 border-t border-border pt-3">
                <FlagButton reportId={report.id} />
              </div>
            )}
          </div>

          {!isOwner && report.hiddenDetail && (
            <ClaimOwnershipButton reportId={report.id} />
          )}

          {isOwner && report.hiddenDetail && (
            <OwnershipClaimsPanel reportId={report.id} />
          )}

          <div className="rounded-3xl bg-ink p-6 text-white/80">
            <p className="flex items-center gap-2 font-semibold text-white">
              <ShieldCheck size={16} className="text-signal" /> Restitution sécurisée
            </p>
            <p className="mt-2 text-sm">
              Ne communiquez jamais vos coordonnées bancaires. Vérifiez toujours un détail unique
              de l&apos;objet avant toute remise en main propre, idéalement dans un lieu public.
            </p>
          </div>

          <ReportTimeline
            createdAt={report.createdAt.toISOString()}
            hasPhotos={report.photos.length > 0}
            hasMatch={!!bestMatch}
            bestMatchScore={bestMatch?.score ?? null}
            hasConversation={conversationCount > 0}
            isResolved={report.status === "RESOLU"}
          />

          {isOwner && (
            <div className="rounded-3xl border border-dashed border-border p-6 text-sm text-text-muted">
              C&apos;est votre signalement. Gérez son statut depuis{" "}
              <a href="/tableau-de-bord" className="font-semibold text-signal">votre tableau de bord</a>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
