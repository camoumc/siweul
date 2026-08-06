import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Connexion requise." },
      { status: 401 }
    );
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "Aucun fichier." },
      { status: 400 }
    );
  }

  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 8 Mo)." },
      { status: 400 }
    );
  }

  const filename = `${session.user.id}-${Date.now()}-${file.name}`;

  try {
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({
      url: blob.url,
    });

  } catch (err) {
  console.error("BLOB ERROR:", err);

  return NextResponse.json(
    {
      error: "Erreur upload Blob",
      details: err instanceof Error ? err.message : String(err),
    },
    { status: 500 }
  );
 }
}