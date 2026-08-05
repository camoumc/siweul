import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const existing = await prisma.ambassador.findUnique({ where: { userId: session.user.id } });
  if (existing) {
    return NextResponse.json({ error: "Vous avez déjà une candidature ou un profil ambassadeur." }, { status: 409 });
  }

  const { zone, city, motivation } = await req.json();
  if (!zone || !city) {
    return NextResponse.json({ error: "Quartier et ville requis." }, { status: 400 });
  }

  const ambassador = await prisma.ambassador.create({
    data: { userId: session.user.id, zone, city, motivation },
  });

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true },
  });
  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type: "SYSTEME" as const,
      title: "Nouvelle candidature Ambassadeur",
      body: `${session.user.name} souhaite devenir ambassadeur à ${city} (${zone}).`,
      link: "/admin/ambassadeurs",
    })),
  });

  return NextResponse.json(ambassador, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const ambassador = await prisma.ambassador.findUnique({
    where: { userId: session.user.id },
    include: {
      earnings: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  return NextResponse.json(ambassador);
}
