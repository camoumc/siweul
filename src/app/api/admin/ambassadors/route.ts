import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const ambassadors = await prisma.ambassador.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, points: true } },
      earnings: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  return NextResponse.json(ambassadors);
}

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { id, status, commissionRate } = await req.json();
  if (!id) return NextResponse.json({ error: "id requis." }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (status) {
    data.status = status;
    if (status === "ACTIF") data.approvedAt = new Date();
  }
  if (commissionRate !== undefined) data.commissionRate = commissionRate;

  const ambassador = await prisma.ambassador.update({ where: { id }, data });

  if (status) {
    const messages: Record<string, string> = {
      ACTIF: "Votre candidature Ambassadeur SIWEUL a été approuvée. Bienvenue !",
      REJETE: "Votre candidature Ambassadeur n'a pas été retenue pour le moment.",
      SUSPENDU: "Votre statut Ambassadeur a été suspendu par l'équipe SIWEUL.",
    };
    if (messages[status]) {
      await prisma.notification.create({
        data: {
          userId: ambassador.userId,
          type: "SYSTEME",
          title: "Statut Ambassadeur mis à jour",
          body: messages[status],
          link: "/ambassadeur",
        },
      });
    }
  }

  return NextResponse.json(ambassador);
}
