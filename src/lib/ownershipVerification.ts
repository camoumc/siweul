/**
 * Calcule un score de vraisemblance (0-100) qu'un réclamant soit le vrai
 * propriétaire d'un objet trouvé, en comparant ce qu'il fournit (IMEI, code
 * secret, description...) au détail caché renseigné par le trouveur et/ou
 * au numéro de série déclaré. Déterministe et explicable — pas d'IA
 * externe requise.
 */
export function computeOwnershipScore(params: {
  providedDetail: string;
  hiddenDetail?: string | null;
  serialOrVin?: string | null;
}): { score: number; label: string; reasons: string[] } {
  const { providedDetail, hiddenDetail, serialOrVin } = params;
  const reasons: string[] = [];
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[\s-]/g, "");

  const provided = normalize(providedDetail);
  let score = 0;

  // Correspondance exacte ou quasi-exacte avec le numéro de série/VIN/IMEI déclaré
  if (serialOrVin) {
    const serial = normalize(serialOrVin);
    if (provided === serial) {
      score = 98;
      reasons.push("Numéro de série / IMEI strictement identique");
      return { score, label: labelFor(score), reasons };
    }
    if (serial.length > 4 && provided.includes(serial.slice(-4))) {
      score += 40;
      reasons.push("Les 4 derniers chiffres du numéro de série correspondent");
    }
  }

  // Comparaison avec le detail cache (mots communs)
  if (hiddenDetail) {
    const hiddenWords = new Set(
      hiddenDetail.toLowerCase().split(/\W+/).filter((w) => w.length > 2)
    );
    const providedWords = new Set(
      providedDetail.toLowerCase().split(/\W+/).filter((w) => w.length > 2)
    );
    let common = 0;
    for (const w of hiddenWords) if (providedWords.has(w)) common += 1;

    if (hiddenWords.size > 0) {
      const ratio = common / hiddenWords.size;
      const points = Math.round(ratio * 55);
      score += points;
      if (ratio >= 0.6) reasons.push("Description très proche du détail caché");
      else if (ratio > 0) reasons.push("Quelques éléments correspondent au détail caché");
    }
  }

  if (reasons.length === 0) {
    reasons.push("Aucune correspondance claire avec les informations enregistrées par le trouveur");
  }

  score = Math.max(0, Math.min(score, 97));
  return { score, label: labelFor(score), reasons };
}

function labelFor(score: number): string {
  if (score >= 85) return "Propriété confirmée";
  if (score >= 50) return "Probabilité moyenne";
  return "Insuffisant";
}
