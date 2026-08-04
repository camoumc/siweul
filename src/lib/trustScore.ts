/**
 * Score de confiance affiché sur les annonces et profils, calculé à partir
 * de signaux disponibles sans dépendance externe. Ce n'est pas une preuve
 * d'identité formelle (voir Phase future : vérification pièce d'identité),
 * mais un indicateur de fiabilité communautaire.
 */
export function computeTrustScore(params: {
  points: number;
  isVerified: boolean;
  accountAgeDays: number;
  resolvedReportsCount: number;
}): number {
  const { points, isVerified, accountAgeDays, resolvedReportsCount } = params;

  let score = 40; // base
  score += Math.min(points / 10, 25); // jusqu'à +25 via les points
  score += Math.min(resolvedReportsCount * 6, 24); // jusqu'à +24 via les résolutions
  score += Math.min(accountAgeDays / 10, 6); // jusqu'à +6 via l'ancienneté
  if (isVerified) score += 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function trustScoreLabel(score: number): string {
  if (score >= 85) return "Excellente";
  if (score >= 65) return "Bonne";
  if (score >= 40) return "Correcte";
  return "Nouveau membre";
}
