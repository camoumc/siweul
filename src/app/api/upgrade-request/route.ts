import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { plan } = await req.json();
  if (!["PREMIUM", "PRO"].includes(plan)) {
    return NextResponse.json({ error: "Plan invalide." }, { status: 400 });
  }

  const requester = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!requester) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true },
  });

  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type: "SYSTEME" as const,
      title: `Demande d'abonnement ${plan}`,
      body: `${requester.name} (${requester.email}) souhaite passer au plan ${plan}.`,
      link: "/admin/utilisateurs",
    })),
  });

  return NextResponse.json({ ok: true });
}
