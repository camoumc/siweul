import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeImage, isAiVisionAvailable } from "@/lib/aiVision";
import { textSimilarity } from "@/lib/matching";

export async function POST(req: Request) {
  if (!isAiVisionAvailable()) {
    return NextResponse.json(
      { error: "La recherche par photo n'est pas encore configurée sur ce site." },
      { status: 503 }
    );
  }

  const { imageUrl, type } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: "imageUrl requis." }, { status: 400 });

  let analysis;
  try {
    analysis = await analyzeImage(imageUrl);
  } catch (e) {
    console.error("Erreur analyse IA:", e);
    return NextResponse.json({ error: "Échec de l'analyse de la photo. Réessayez." }, { status: 500 });
  }

  const candidates = await prisma.report.findMany({
    where: {
      status: "ACTIVE",
      ...(type ? { type } : {}),
    },
    include: { photos: { take: 1 }, owner: { select: { name: true } } },
    take: 300,
    orderBy: { createdAt: "desc" },
  });

  const scored = candidates.map((report) => {
    let score = 0;
    let weight = 0;
    const reasons: string[] = [];

    // Categorie (comparaison texte souple : "Téléphone" vs "Téléphone / Électronique")
    weight += 30;
    const catSim = textSimilarity(analysis.category, report.category ?? report.title);
    if (catSim > 0.3 || (report.category ?? "").toLowerCase().includes(analysis.category.toLowerCase())) {
      score += 30;
      reasons.push("Catégorie similaire");
    } else {
      score += catSim * 30;
    }

    // Couleur
    if (analysis.color && report.color) {
      weight += 20;
      if (analysis.color.toLowerCase().trim() === report.color.toLowerCase().trim()) {
        score += 20;
        reasons.push("Même couleur");
      }
    }

    // Marque
    if (analysis.brand && report.brand) {
      weight += 20;
      if (analysis.brand.toLowerCase().trim() === report.brand.toLowerCase().trim()) {
        score += 20;
        reasons.push("Même marque");
      }
    }

    // Résumé IA vs titre/description
    weight += 30;
    const textSim = Math.max(
      textSimilarity(analysis.summary, report.title),
      textSimilarity(analysis.summary, report.description),
      textSimilarity(analysis.distinguishingFeatures, report.description)
    );
    score += textSim * 30;
    if (textSim > 0.3) reasons.push("Description visuelle proche");

    const finalScore = weight > 0 ? Math.round((score / weight) * 100) : 0;
    return { report, score: Math.min(finalScore, 97), reasons };
  });

  const results = scored
    .filter((r) => r.score >= 35)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
    .map((r) => ({
      id: r.report.id,
      title: r.report.title,
      type: r.report.type,
      city: r.report.city,
      photo: r.report.photos[0]?.url ?? null,
      score: r.score,
      reasons: r.reasons,
    }));

  return NextResponse.json({ analysis, results });
}
