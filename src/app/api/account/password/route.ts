import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Mot de passe actuel et nouveau requis." }, { status: 400 });
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    return NextResponse.json(
      { error: "Le nouveau mot de passe doit contenir au moins 6 caractères." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Introuvable." }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "SYSTEME",
      title: "Mot de passe modifié",
      body: "Votre mot de passe vient d'être changé depuis votre profil.",
    },
  });

  return NextResponse.json({ ok: true });
}
