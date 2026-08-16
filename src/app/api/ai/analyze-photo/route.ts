import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { analyzeImage, isAiVisionAvailable } from "@/lib/aiVision";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  if (!isAiVisionAvailable()) {
    return NextResponse.json(
      { error: "L'analyse IA n'est pas encore configurée sur ce site." },
      { status: 503 }
    );
  }

  const { imageUrl } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: "imageUrl requis." }, { status: 400 });

  try {
    const analysis = await analyzeImage(imageUrl);
    return NextResponse.json(analysis);
  } catch (e) {
    console.error("Erreur analyse IA:", e);
    return NextResponse.json({ error: "Échec de l'analyse IA. Réessayez." }, { status: 500 });
  }
}
