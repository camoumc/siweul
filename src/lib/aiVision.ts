/**
 * Analyse une photo (objet perdu/trouvé, document, animal) via l'API Claude
 * Vision d'Anthropic pour en extraire des attributs structurés, utilisés
 * ensuite pour la recherche inversée et pour pré-remplir le formulaire de
 * signalement. Nécessite ANTHROPIC_API_KEY — sans elle, la fonctionnalité
 * se désactive proprement (voir isAiVisionAvailable).
 */

export interface ImageAnalysis {
  category: string; // ex: "Téléphone", "Sac à dos", "Chat", "Passeport"
  color: string | null;
  brand: string | null;
  distinguishingFeatures: string; // rayures, autocollants, accessoires...
  visibleText: string | null; // texte/numéros lisibles sur la photo
  summary: string; // description en une phrase, utilisée pour la recherche
}

export function isAiVisionAvailable() {
  return !!process.env.ANTHROPIC_API_KEY;
}

async function fetchImageAsBase64(imageUrl: string): Promise<{ data: string; mediaType: string }> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error("Impossible de récupérer la photo.");
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return { data: base64, mediaType: contentType };
}

export async function analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY n'est pas configuré.");
  }

  const { data, mediaType } = await fetchImageAsBase64(imageUrl);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data } },
            {
              type: "text",
              text: `Analyse cette photo d'un objet perdu/trouvé, animal ou document pour une plateforme d'objets perdus au Sénégal.
Réponds UNIQUEMENT avec un objet JSON valide (sans balises markdown, sans texte avant/après) au format exact :
{"category": "...", "color": "..." ou null, "brand": "..." ou null, "distinguishingFeatures": "...", "visibleText": "..." ou null, "summary": "..."}

- category : type d'objet en français (ex: "Téléphone", "Sac à dos", "Chien", "Passeport", "Voiture")
- color : couleur dominante, ou null si non pertinent
- brand : marque visible si identifiable, sinon null
- distinguishingFeatures : rayures, autocollants, accessoires, motifs, race d'animal, particularités visuelles (2-3 éléments courts)
- visibleText : tout texte, numéro ou inscription lisible sur la photo, sinon null
- summary : une phrase descriptive courte résumant l'objet, utile pour une recherche textuelle`,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Erreur API Claude Vision (${res.status}): ${text}`);
  }

  const json = await res.json();
  const textBlock = json.content?.find((c: { type: string }) => c.type === "text");
  if (!textBlock?.text) throw new Error("Réponse IA vide.");

  const cleaned = textBlock.text.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
  try {
    return JSON.parse(cleaned) as ImageAnalysis;
  } catch {
    throw new Error("Impossible d'interpréter la réponse de l'IA.");
  }
}
