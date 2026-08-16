import type { Report } from "@prisma/client";

/**
 * Moteur de correspondance SIWEUL.
 * Calcule un score de similarité (0-100) entre deux signalements,
 * en combinant : texte (description/titre), catégorie, couleur, marque,
 * numéro de série/VIN, proximité géographique et proximité de date.
 *
 * Ce n'est pas un modèle de deep-learning (pas d'inférence externe requise,
 * donc aucune clé API n'est nécessaire), mais un algorithme déterministe
 * et explicable, adapté à un MVP en production immédiate. Il peut être
 * remplacé plus tard par un modèle d'embeddings (ex. via l'API Anthropic/OpenAI)
 * sans changer l'interface `computeMatchScore`.
 */

// Distance de Levenshtein normalisée -> similarité texte simple (0-1)
export function textSimilarity(a?: string | null, b?: string | null): number {
  if (!a || !b) return 0;
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;

  const words1 = new Set(s1.split(/\W+/).filter((w) => w.length > 2));
  const words2 = new Set(s2.split(/\W+/).filter((w) => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;

  let common = 0;
  for (const w of words1) if (words2.has(w)) common += 1;

  return common / Math.max(words1.size, words2.size);
}

export function haversineDistanceKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface MatchResult {
  score: number;
  reasons: string[];
}

export function computeMatchScore(a: Report, b: Report): MatchResult {
  const reasons: string[] = [];
  let weightedSum = 0;
  let weightTotal = 0;

  // 1. Numéro de série / VIN / plaque : correspondance quasi certaine
  if (a.serialOrVin && b.serialOrVin) {
    const norm = (s: string) => s.replace(/[\s-]/g, "").toLowerCase();
    if (norm(a.serialOrVin) === norm(b.serialOrVin)) {
      reasons.push("Numéro de série / VIN / plaque identique");
      return { score: 99, reasons };
    }
  }

  // 2. Catégorie (poids fort)
  const catWeight = 25;
  weightTotal += catWeight;
  if (a.category && b.category && a.category === b.category) {
    weightedSum += catWeight;
    reasons.push(`Même catégorie (${a.category})`);
  }

  // 3. Similarité texte titre + description (poids fort)
  const textWeight = 30;
  weightTotal += textWeight;
  const simTitle = textSimilarity(a.title, b.title);
  const simDesc = textSimilarity(a.description, b.description);
  const simText = Math.max(simTitle, simDesc);
  weightedSum += simText * textWeight;
  if (simText > 0.3) reasons.push("Description et titre similaires");

  // 4. Couleur
  const colorWeight = 12;
  weightTotal += colorWeight;
  if (a.color && b.color && a.color.toLowerCase().trim() === b.color.toLowerCase().trim()) {
    weightedSum += colorWeight;
    reasons.push(`Même couleur (${a.color})`);
  }

  // 5. Marque
  const brandWeight = 13;
  weightTotal += brandWeight;
  if (a.brand && b.brand && a.brand.toLowerCase().trim() === b.brand.toLowerCase().trim()) {
    weightedSum += brandWeight;
    reasons.push(`Même marque (${a.brand})`);
  }

  // 6. Proximité géographique (poids fort, dégressif jusqu'à 15km)
  const geoWeight = 12;
  weightTotal += geoWeight;
  const dist = haversineDistanceKm(a.latitude, a.longitude, b.latitude, b.longitude);
  if (dist != null) {
    if (dist <= 15) {
      const geoScore = 1 - dist / 15;
      weightedSum += geoScore * geoWeight;
      if (dist < 3) reasons.push("Localisation très proche (< 3 km)");
      else reasons.push(`Localisation proche (${dist.toFixed(1)} km)`);
    }
  } else if (a.city && b.city && a.city.toLowerCase() === b.city.toLowerCase()) {
    weightedSum += geoWeight * 0.5;
    reasons.push(`Même ville (${a.city})`);
  }

  // 7. Proximité de date (fenêtre de 30 jours)
  const dateWeight = 8;
  weightTotal += dateWeight;
  const diffDays =
    Math.abs(new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()) /
    (1000 * 60 * 60 * 24);
  if (diffDays <= 30) {
    const dateScore = 1 - diffDays / 30;
    weightedSum += dateScore * dateWeight;
    if (diffDays <= 2) reasons.push("Dates quasi identiques");
  }

  const finalScore = Math.round((weightedSum / weightTotal) * 100);
  return { score: Math.max(0, Math.min(finalScore, 98)), reasons };
}

// Paires de types considérées comme "opposées" et donc comparables entre elles
export const OPPOSITE_TYPE: Record<string, string> = {
  OBJET_PERDU: "OBJET_TROUVE",
  OBJET_TROUVE: "OBJET_PERDU",
  VEHICULE_VOLE: "VEHICULE_VOLE", // deux signalements du même vol peuvent se recouper
  ANIMAL_PERDU: "ANIMAL_PERDU",
  DOCUMENT_PERDU: "DOCUMENT_PERDU",
  PERSONNE_DISPARUE: "PERSONNE_DISPARUE",
};

export const MATCH_THRESHOLD = 55; // score minimum pour déclencher une notification
