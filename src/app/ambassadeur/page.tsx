import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AmbassadorApplyForm from "@/components/AmbassadorApplyForm";
import AmbassadorDashboard from "@/components/AmbassadorDashboard";
import { Clock, XCircle } from "lucide-react";

export default async function AmbassadorPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/ambassadeur");

  const ambassador = await prisma.ambassador.findUnique({
    where: { userId: session.user.id },
    include: { earnings: { orderBy: { createdAt: "desc" }, take: 50 } },
  });

  if (!ambassador) return <AmbassadorApplyForm />;

  if (ambassador.status === "EN_ATTENTE") {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <Clock className="mx-auto text-gold" size={32} />
        <h1 className="mt-4 font-display text-2xl font-semibold text-text">
          Candidature en cours d&apos;examen
        </h1>
        <p className="mt-2 text-text-muted">
          Merci pour votre candidature pour {ambassador.zone}, {ambassador.city}. Notre
          équipe l&apos;examine et vous notifiera dès qu&apos;une décision sera prise.
        </p>
      </div>
    );
  }

  if (ambassador.status === "REJETE" || ambassador.status === "SUSPENDU") {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <XCircle className="mx-auto text-alert" size={32} />
        <h1 className="mt-4 font-display text-2xl font-semibold text-text">
          {ambassador.status === "SUSPENDU" ? "Statut suspendu" : "Candidature non retenue"}
        </h1>
        <p className="mt-2 text-text-muted">
          Contactez notre équipe via la page Contact si vous pensez qu&apos;il s&apos;agit
          d&apos;une erreur.
        </p>
      </div>
    );
  }

  return (
    <AmbassadorDashboard
      ambassador={{
        ...ambassador,
        approvedAt: ambassador.approvedAt?.toISOString() ?? null,
        earnings: ambassador.earnings.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
      }}
    />
  );
}
