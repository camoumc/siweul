import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";
import { notifyUser } from "@/lib/notify";

// amount peut être négatif (correction/retrait).
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { ambassadorId, amount, reason } = await req.json();
  if (!ambassadorId || !amount || !reason) {
    return NextResponse.json({ error: "ambassadorId, amount et reason requis." }, { status: 400 });
  }

  const ambassador = await prisma.ambassador.findUnique({ where: { id: ambassadorId } });
  if (!ambassador) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  await prisma.ambassadorEarning.create({
    data: { ambassadorId, amount: Number(amount), reason, status: "VALIDE" },
  });
  await prisma.ambassador.update({
    where: { id: ambassadorId },
    data: { totalEarned: { increment: Number(amount) } },
  });

  await notifyUser({
    userId: ambassador.userId,
    type: "SYSTEME",
    title: `Ajustement de ${Number(amount) > 0 ? "+" : ""}${amount} FCFA`,
    body: reason,
    link: "/ambassadeur",
    email: true,
  });

  return NextResponse.json({ ok: true });
}
