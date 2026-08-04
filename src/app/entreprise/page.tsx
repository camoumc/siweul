import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateOrgForm from "@/components/CreateOrgForm";
import OrgDashboard from "@/components/OrgDashboard";
import { Building2 } from "lucide-react";

const INSTITUTION_ROLES = ["ENTREPRISE", "POLICE", "GENDARMERIE", "MAIRIE", "HOPITAL", "ASSOCIATION"];

export default async function EntreprisePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/entreprise");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, organizationId: true, ownedOrganization: { select: { id: true } } },
  });

  const orgId = me?.ownedOrganization?.id ?? me?.organizationId;

  if (!orgId) {
    if (me && INSTITUTION_ROLES.includes(me.role)) {
      return <CreateOrgForm />;
    }
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <Building2 className="mx-auto text-signal" size={32} />
        <h1 className="mt-4 font-display text-2xl font-semibold text-text">
          Espace réservé aux institutions & entreprises
        </h1>
        <p className="mt-2 text-text-muted">
          Ce compte est un compte particulier. Pour activer un espace organisation
          (commissariat, mairie, hôtel, aéroport, entreprise...), contactez notre équipe
          depuis la page Contact — nous mettrons à jour votre rôle.
        </p>
        <a href="/contact" className="mt-6 inline-block rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white hover:bg-signal-dark">
          Demander un compte institution
        </a>
      </div>
    );
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { select: { id: true, name: true, email: true, role: true } },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          city: true,
          createdAt: true,
          owner: { select: { name: true } },
        },
      },
    },
  });

  if (!org) redirect("/entreprise");

  const resolvedCount = org.reports.filter((r) => r.status === "RESOLU").length;

  return (
    <OrgDashboard
      org={{
        id: org.id,
        name: org.name,
        type: org.type,
        isVerified: org.isVerified,
        isOwner: org.ownerId === session.user.id,
        owner: org.owner,
        members: org.members,
        reports: org.reports.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
        stats: {
          totalReports: org.reports.length,
          resolvedCount,
          memberCount: org.members.length,
        },
      }}
    />
  );
}
