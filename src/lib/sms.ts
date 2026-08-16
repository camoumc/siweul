/**
 * Envoi de SMS et WhatsApp via l'API REST Twilio (https://twilio.com).
 * Nécessite TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_PHONE_NUMBER
 * (SMS) et/ou TWILIO_WHATSAPP_NUMBER (WhatsApp, ex: "whatsapp:+14155238886"
 * pour le sandbox Twilio). Sans ces variables, les envois sont simplement
 * journalisés au lieu d'échouer bruyamment (même principe que Stripe/email).
 */

function twilioConfigured() {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
}

/** Normalise un numéro sénégalais vers le format international (+221...). */
export function toInternationalFormat(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("221")) return `+${digits}`;
  if (digits.startsWith("0")) return `+221${digits.slice(1)}`;
  if (digits.length === 9) return `+221${digits}`;
  return null;
}

async function twilioRequest(to: string, from: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur Twilio (${res.status}): ${text}`);
  }
  return res.json();
}

export async function sendSms(toRaw: string, body: string) {
  const to = toInternationalFormat(toRaw);
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!twilioConfigured() || !from || !to) {
    console.warn(`[SMS non envoyé — Twilio non configuré ou numéro invalide] À: ${toRaw} | ${body}`);
    return { simulated: true };
  }
  return twilioRequest(to, from, body);
}

export async function sendWhatsApp(toRaw: string, body: string) {
  const to = toInternationalFormat(toRaw);
  const from = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!twilioConfigured() || !from || !to) {
    console.warn(`[WhatsApp non envoyé — Twilio non configuré ou numéro invalide] À: ${toRaw} | ${body}`);
    return { simulated: true };
  }
  return twilioRequest(`whatsapp:${to}`, from, body);
}
