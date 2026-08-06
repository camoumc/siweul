import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { id } = await params;
  const ambassador = await prisma.ambassador.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, points: true, createdAt: true } },
      earnings: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!ambassador) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  return NextResponse.json(ambassador);
}
