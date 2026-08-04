import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminGuard";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const rules = await prisma.pricingRule.findMany({ orderBy: [{ category: "asc" }, { label: "asc" }] });
  return NextResponse.json(rules);
}

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { id, amount, active } = await req.json();
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (amount !== undefined) data.amount = amount;
  if (active !== undefined) data.active = active;

  const rule = await prisma.pricingRule.update({ where: { id }, data });
  return NextResponse.json(rule);
}
