/**
 * Envoi d'email transactionnel via l'API Resend (https://resend.com — gratuit
 * jusqu'à 3000 emails/mois, aucune dépendance lourde requise, simple appel
 * HTTP). Si RESEND_API_KEY n'est pas configuré, on journalise le contenu en
 * console à la place (utile en développement, ou tant que l'admin n'a pas
 * encore branché de fournisseur d'email) plutôt que de faire échouer toute
 * la fonctionnalité.
 */
export async function sendEmail(params: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "SIWEUL <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(
      `[email non envoyé — RESEND_API_KEY absent] À: ${params.to} | Sujet: ${params.subject}\n${params.html}`
    );
    return { simulated: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Échec de l'envoi d'email (${res.status}): ${text}`);
  }

  return res.json();
}

export function passwordResetEmailHtml(resetUrl: string) {
  return `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color:#14173a;">Réinitialisation de votre mot de passe SIWEUL</h2>
    <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous (valable 1 heure) :</p>
    <p style="text-align:center; margin: 32px 0;">
      <a href="${resetUrl}" style="background:#f2762e; color:white; padding:12px 24px; border-radius:999px; text-decoration:none; font-weight:600;">
        Réinitialiser mon mot de passe
      </a>
    </p>
    <p style="color:#5a5a68; font-size:13px;">
      Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email —
      votre mot de passe actuel reste inchangé.
    </p>
    <p style="color:#5a5a68; font-size:13px;">Ou copiez ce lien : ${resetUrl}</p>
  </div>`;
}
