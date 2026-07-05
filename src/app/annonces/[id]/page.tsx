import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { REPORT_TYPES, type ReportTypeKey } from "@/lib/reportConfig";
import { MapPin, Calendar, Gift, ShieldCheck, User } from "lucide-react";
import ContactButton from "@/components/ContactButton";
import ShareButtons from "@/components/ShareButtons";

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
      owner: { select: { id: true, name: true, isVerified: true, createdAt: true } },
    },
  });

  if (!report) notFound();

  const cfg = REPORT_TYPES[report.type as ReportTypeKey];
  const isOwner = session?.user?.id === report.ownerId;
  const url = `${process.env.NEXTAUTH_URL ?? "https://siweul.vercel.app"}/annonces/${report.id}`;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
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
            <ShareButtons title={`SIWEUL — ${report.title}`} url={url} />
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
            <div className="mt-4">
              <ContactButton reportId={report.id} isOwner={isOwner} />
            </div>
          </div>

          <div className="rounded-3xl bg-ink p-6 text-white/80">
            <p className="flex items-center gap-2 font-semibold text-white">
              <ShieldCheck size={16} className="text-signal" /> Restitution sécurisée
            </p>
            <p className="mt-2 text-sm">
              Ne communiquez jamais vos coordonnées bancaires. Vérifiez toujours un détail unique
              de l&apos;objet avant toute remise en main propre, idéalement dans un lieu public.
            </p>
          </div>

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
