import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
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
        { error: "Aucun fichier reçu." },
        { status: 400 }
      );
    }

    // Limite 8 Mo
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (maximum 8 Mo)." },
        { status: 400 }
      );
    }


    const filename = `${session.user.id}-${Date.now()}-${file.name}`;


    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    });


    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
    });


  } catch (error) {

    console.error("BLOB UPLOAD ERROR:", error);


    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur upload Blob",
      },
      { status: 500 }
    );
  }
}