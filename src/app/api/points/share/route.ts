import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { awardPoints } from "@/lib/points";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { reportId } = await req.json();
  if (!reportId) return NextResponse.json({ error: "reportId requis" }, { status: 400 });

  await awardPoints(session.user.id, 5, "Partage d'une annonce");
  return NextResponse.json({ ok: true });
}
