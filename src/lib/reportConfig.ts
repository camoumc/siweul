export type ReportTypeKey =
  | "OBJET_PERDU"
  | "OBJET_TROUVE"
  | "PERSONNE_DISPARUE"
  | "ANIMAL_PERDU"
  | "VEHICULE_VOLE"
  | "DOCUMENT_PERDU";

export const REPORT_TYPES: Record<
  ReportTypeKey,
  {
    label: string;
    labelPlural: string;
    shortLabel: string;
    color: string; // classe tailwind text
    bg: string; // classe tailwind bg pale
    ring: string;
    description: string;
    categories?: string[];
  }
> = {
  OBJET_PERDU: {
    label: "Objet perdu",
    labelPlural: "Objets perdus",
    shortLabel: "Perdu",
    color: "text-amber-700",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    description: "Signalez un objet que vous avez égaré.",
    categories: [
      "Téléphone / Électronique",
      "Sac / Bagagerie",
      "Clés",
      "Bijoux",
      "Vêtements",
      "Portefeuille / Argent",
      "Autre",
    ],
  },
  OBJET_TROUVE: {
    label: "Objet trouvé",
    labelPlural: "Objets trouvés",
    shortLabel: "Trouvé",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    description: "Vous avez trouvé un objet ? Aidez son propriétaire à le retrouver.",
    categories: [
      "Téléphone / Électronique",
      "Sac / Bagagerie",
      "Clés",
      "Bijoux",
      "Vêtements",
      "Portefeuille / Argent",
      "Autre",
    ],
  },
  PERSONNE_DISPARUE: {
    label: "Personne disparue",
    labelPlural: "Personnes disparues",
    shortLabel: "Disparu(e)",
    color: "text-rose-700",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
    description: "Signalement urgent d'une disparition, priorité maximale.",
    categories: ["Enfant", "Adulte", "Personne âgée", "Personne malade", "Personne handicapée"],
  },
  ANIMAL_PERDU: {
    label: "Animal perdu",
    labelPlural: "Animaux perdus",
    shortLabel: "Animal",
    color: "text-orange-700",
    bg: "bg-orange-50",
    ring: "ring-orange-200",
    description: "Retrouvez votre compagnon à quatre pattes ou à plumes.",
    categories: ["Chien", "Chat", "Cheval", "Oiseau", "Autre"],
  },
  VEHICULE_VOLE: {
    label: "Véhicule volé",
    labelPlural: "Véhicules volés",
    shortLabel: "Véhicule",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    ring: "ring-indigo-200",
    description: "Signalez un vol de véhicule pour alerter la communauté.",
    categories: ["Voiture", "Moto", "Camion", "Bus", "Vélo", "Scooter"],
  },
  DOCUMENT_PERDU: {
    label: "Document administratif",
    labelPlural: "Documents perdus",
    shortLabel: "Document",
    color: "text-teal-700",
    bg: "bg-teal-50",
    ring: "ring-teal-200",
    description: "CNI, passeport, permis, carte grise, diplôme...",
    categories: [
      "Carte nationale d'identité",
      "Passeport",
      "Permis de conduire",
      "Carte bancaire",
      "Carte étudiant",
      "Carte professionnelle",
      "Carte grise",
      "Diplôme",
      "Acte de naissance",
      "Autre document",
    ],
  },
};

export const REPORT_TYPE_ORDER: ReportTypeKey[] = [
  "OBJET_PERDU",
  "OBJET_TROUVE",
  "PERSONNE_DISPARUE",
  "ANIMAL_PERDU",
  "VEHICULE_VOLE",
  "DOCUMENT_PERDU",
];

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  EN_VERIFICATION: "En vérification",
  RESOLU: "Résolu",
  ARCHIVE: "Archivé",
  SUPPRIME: "Supprimé",
};

export const SENEGAL_CITIES = [
  "Dakar",
  "Pikine",
  "Guédiawaye",
  "Rufisque",
  "Thiès",
  "Mbour",
  "Saint-Louis",
  "Touba",
  "Kaolack",
  "Ziguinchor",
  "Diourbel",
  "Louga",
  "Tambacounda",
  "Kolda",
  "Matam",
  "Fatick",
  "Kaffrine",
  "Kédougou",
  "Sédhiou",
];
