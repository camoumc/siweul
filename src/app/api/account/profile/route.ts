import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { name, phone, city } = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof phone === "string") data.phone = phone.trim() || null;
  if (typeof city === "string") data.city = city.trim() || null;

  const user = await prisma.user.update({ where: { id: session.user.id }, data });
  return NextResponse.json({ id: user.id, name: user.name, phone: user.phone, city: user.city });
}
