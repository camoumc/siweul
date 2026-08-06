import { prisma } from "@/lib/prisma";
import { sendEmail, genericNotificationEmailHtml } from "@/lib/email";
import type { NotificationType } from "@prisma/client";

/**
 * Crée une notification in-app, et envoie AUSSI un email si `email: true`
 * (utilisé pour les événements importants : validation ambassadeur,
 * paiement confirmé, versement effectué...). Les événements fréquents/peu
 * critiques (nouveau message, correspondance IA) restent in-app uniquement
 * pour éviter de spammer la boîte mail des utilisateurs.
 */
export async function notifyUser(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  email?: boolean;
}) {
  const { userId, type, title, body, link, email } = params;

  await prisma.notification.create({ data: { userId, type, title, body, link } });

  if (email) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (user?.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: title,
          html: genericNotificationEmailHtml(title, body, link),
        });
      } catch (e) {
        console.error("Erreur envoi email de notification:", e);
      }
    }
  }
}
