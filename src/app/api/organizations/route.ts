import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const INSTITUTION_ROLES = [
  "ENTREPRISE",
  "POLICE",
  "GENDARMERIE",
  "MAIRIE",
  "HOPITAL",
  "ASSOCIATION",
];

// Crée l'organisation de l'utilisateur connecté (il doit avoir un rôle
// institution et ne pas déjà en posséder une).
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  if (!INSTITUTION_ROLES.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Seuls les comptes institution/entreprise peuvent créer un espace organisation." },
      { status: 403 }
    );
  }

  const { name, type } = await req.json();
  if (!name || !type) {
    return NextResponse.json({ error: "Nom et type requis." }, { status: 400 });
  }

  const existing = await prisma.organization.findUnique({ where: { ownerId: session.user.id } });
  if (existing) {
    return NextResponse.json({ error: "Vous avez déjà une organisation." }, { status: 409 });
  }

  const org = await prisma.organization.create({
    data: { name, type, ownerId: session.user.id },
  });

  return NextResponse.json(org, { status: 201 });
}

// Retourne l'organisation de l'utilisateur connecté (propriétaire ou membre),
// avec ses statistiques.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      organizationId: true,
      ownedOrganization: { select: { id: true } },
    },
  });

  const orgId = me?.ownedOrganization?.id ?? me?.organizationId;
  if (!orgId) return NextResponse.json(null);

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: { select: { id: true, name: true, email: true, role: true } },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { photos: true, owner: { select: { name: true } } },
      },
    },
  });
  if (!org) return NextResponse.json(null);

  const resolvedCount = org.reports.filter((r) => r.status === "RESOLU").length;

  return NextResponse.json({
    ...org,
    isOwner: org.ownerId === session.user.id,
    stats: {
      totalReports: org.reports.length,
      resolvedCount,
      memberCount: org.members.length,
    },
  });
}
