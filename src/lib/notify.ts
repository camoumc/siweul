import { prisma } from "@/lib/prisma";
import { sendEmail, genericNotificationEmailHtml } from "@/lib/email";
import { sendSms, sendWhatsApp } from "@/lib/sms";
import type { NotificationType } from "@prisma/client";

/**
 * Crée une notification in-app, et envoie en plus email/SMS/WhatsApp selon
 * les flags demandés :
 * - `email: true` pour les événements importants (validation, paiement...)
 * - `sms` / `whatsapp: true` réservés aux évènements URGENTS (personne
 *   disparue, véhicule volé, document officiel) pour ne pas spammer les
 *   utilisateurs ni générer de coûts inutiles sur les cas normaux.
 */
export async function notifyUser(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  email?: boolean;
  sms?: boolean;
  whatsapp?: boolean;
}) {
  const { userId, type, title, body, link, email, sms, whatsapp } = params;

  await prisma.notification.create({ data: { userId, type, title, body, link } });

  if (!email && !sms && !whatsapp) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, phone: true },
  });
  if (!user) return;

  if (email) {
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

  const smsBody = `SIWEUL — ${title}\n${body}`;
  if (sms && user.phone) {
    try {
      await sendSms(user.phone, smsBody);
    } catch (e) {
      console.error("Erreur envoi SMS:", e);
    }
  }
  if (whatsapp && user.phone) {
    try {
      await sendWhatsApp(user.phone, smsBody);
    } catch (e) {
      console.error("Erreur envoi WhatsApp:", e);
    }
  }
}

/** Types de signalements jugés urgents : SMS/WhatsApp envoyés en plus de
 * l'email/notification in-app lors d'une correspondance ou d'un évènement
 * important les concernant. */
export const URGENT_REPORT_TYPES = ["PERSONNE_DISPARUE", "VEHICULE_VOLE", "DOCUMENT_PERDU"];
