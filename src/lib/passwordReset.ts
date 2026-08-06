import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 heure

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Crée un jeton de réinitialisation. Retourne le jeton EN CLAIR (à mettre
 * dans l'URL de l'email) — seul son hash est stocké en base, comme pour un
 * mot de passe. */
export async function createPasswordResetToken(userId: string): Promise<string> {
  // On invalide les anciens jetons non utilisés pour cet utilisateur.
  await prisma.passwordResetToken.deleteMany({ where: { userId, usedAt: null } });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return token;
}

export async function verifyPasswordResetToken(token: string) {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;
  return record;
}

export async function consumePasswordResetToken(id: string) {
  await prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
}
