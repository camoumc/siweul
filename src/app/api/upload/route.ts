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
    console.log("BLOB TOKEN PRESENT:", !!process.env.BLOB_READ_WRITE_TOKEN);
    console.log("UPLOAD FILE:", filename);
    console.log("SIZE:", file.size);

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    });

    console.log("BLOB SUCCESS:", blob.url);

    return NextResponse.json({
      success: true,
      url: blob.url,
    });

  } catch (err) {

    console.error("========== BLOB ERROR ==========");
    console.error(err);

    return NextResponse.json(
      {
        error: "Erreur upload Blob",
        message:
          err instanceof Error
            ? err.message
            : String(err),
        stack:
          err instanceof Error
            ? err.stack
            : null,
      },
      {
        status: 500,
      }
    );
  }
}