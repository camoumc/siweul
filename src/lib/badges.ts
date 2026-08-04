export interface BadgeDef {
  key: string;
  label: string;
  description: string;
  icon: string; // nom d'icône lucide-react
  threshold?: number; // seuil de points pour obtention automatique
}

export const BADGES: BadgeDef[] = [
  {
    key: "PREMIER_SIGNALEMENT",
    label: "Premier signalement",
    description: "A publié son tout premier signalement sur SIWEUL.",
    icon: "Flag",
  },
  {
    key: "AIDANT",
    label: "Aidant",
    description: "A aidé à résoudre un signalement (objet remis, personne retrouvée...).",
    icon: "HeartHandshake",
  },
  {
    key: "AMBASSADEUR_BRONZE",
    label: "Ambassadeur Bronze",
    description: "A atteint 100 points communautaires.",
    icon: "Award",
    threshold: 100,
  },
  {
    key: "AMBASSADEUR_ARGENT",
    label: "Ambassadeur Argent",
    description: "A atteint 500 points communautaires.",
    icon: "Medal",
    threshold: 500,
  },
  {
    key: "AMBASSADEUR_OR",
    label: "Ambassadeur Or",
    description: "A atteint 1500 points communautaires.",
    icon: "Trophy",
    threshold: 1500,
  },
  {
    key: "VERIFIE",
    label: "Profil vérifié",
    description: "Identité vérifiée par l'équipe SIWEUL.",
    icon: "BadgeCheck",
  },
];

export function getBadge(key: string): BadgeDef | undefined {
  return BADGES.find((b) => b.key === key);
}

// Badges à seuil de points, évalués automatiquement à chaque gain de points
export const THRESHOLD_BADGES = BADGES.filter((b) => typeof b.threshold === "number");
