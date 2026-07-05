import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      plan: true,
      isBanned: true,
      isVerified: true,
      points: true,
      createdAt: true,
      _count: { select: { reports: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(users);
}

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { id, role, isBanned, isVerified, plan } = await req.json();
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  // Seul un SUPER_ADMIN peut modifier les rôles administrateurs
  if (role && !["SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json(
      { error: "Seul un super administrateur peut changer les rôles." },
      { status: 403 }
    );
  }

  const data: Record<string, unknown> = {};
  if (role !== undefined) data.role = role;
  if (isBanned !== undefined) data.isBanned = isBanned;
  if (isVerified !== undefined) data.isVerified = isVerified;
  if (plan !== undefined) data.plan = plan;

  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json(user);
}
