import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireOrgOwner(userId: string) {
  const org = await prisma.organization.findUnique({ where: { ownerId: userId } });
  return org;
}

// Ajoute un utilisateur existant (par email) comme membre de l'organisation.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const org = await requireOrgOwner(session.user.id);
  if (!org) {
    return NextResponse.json({ error: "Vous n'êtes pas propriétaire d'une organisation." }, { status: 403 });
  }

  const { email } = await req.json();
  const member = await prisma.user.findUnique({ where: { email } });
  if (!member) {
    return NextResponse.json(
      { error: "Aucun compte SIWEUL avec cet email. La personne doit d'abord créer un compte." },
      { status: 404 }
    );
  }
  if (member.id === session.user.id) {
    return NextResponse.json({ error: "Vous êtes déjà propriétaire de l'organisation." }, { status: 400 });
  }

  await prisma.user.update({ where: { id: member.id }, data: { organizationId: org.id } });
  await prisma.notification.create({
    data: {
      userId: member.id,
      type: "SYSTEME",
      title: "Ajouté à une organisation",
      body: `Vous avez été ajouté à l'organisation "${org.name}" sur SIWEUL.`,
      link: "/entreprise",
    },
  });

  return NextResponse.json({ ok: true });
}

// Retire un membre de l'organisation.
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const org = await requireOrgOwner(session.user.id);
  if (!org) {
    return NextResponse.json({ error: "Vous n'êtes pas propriétaire d'une organisation." }, { status: 403 });
  }

  const { userId } = await req.json();
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.organizationId !== org.id) {
    return NextResponse.json({ error: "Ce membre n'appartient pas à votre organisation." }, { status: 404 });
  }

  await prisma.user.update({ where: { id: userId }, data: { organizationId: null } });
  return NextResponse.json({ ok: true });
}
