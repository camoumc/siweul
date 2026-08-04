import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const flags = await prisma.reportFlag.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { name: true, email: true } },
      report: { select: { id: true, title: true, type: true, status: true } },
    },
    take: 200,
  });

  return NextResponse.json(flags);
}

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "id et status requis" }, { status: 400 });

  const flag = await prisma.reportFlag.update({ where: { id }, data: { status } });
  return NextResponse.json(flag);
}
