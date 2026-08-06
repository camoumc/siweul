import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyPasswordResetToken, consumePasswordResetToken } from "@/lib/passwordReset";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: "Jeton et mot de passe requis." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères." }, { status: 400 });
  }

  const record = await verifyPasswordResetToken(token);
  if (!record) {
    return NextResponse.json(
      { error: "Ce lien de réinitialisation est invalide ou a expiré." },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: record.userId }, data: { password: hashed } });
  await consumePasswordResetToken(record.id);

  await prisma.notification.create({
    data: {
      userId: record.userId,
      type: "SYSTEME",
      title: "Mot de passe modifié",
      body: "Votre mot de passe a été réinitialisé avec succès.",
    },
  });

  return NextResponse.json({ ok: true });
}
