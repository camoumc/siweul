import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/passwordReset";
import { sendEmail, passwordResetEmailHtml } from "@/lib/email";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email requis." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Par sécurité, on ne révèle jamais si l'email existe ou non : la réponse
  // est toujours la même, que le compte existe ou pas.
  if (user && !user.isBanned) {
    const token = await createPasswordResetToken(user.id);
    const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const resetUrl = `${origin}/reinitialiser-mot-de-passe?token=${token}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe SIWEUL",
        html: passwordResetEmailHtml(resetUrl),
      });
    } catch (e) {
      console.error("Erreur d'envoi d'email de réinitialisation:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    message: "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.",
  });
}
