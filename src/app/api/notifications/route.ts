import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor"); // id de notification
  const limitParam = Number(searchParams.get("limit"));
  const take = Math.min(limitParam || PAGE_SIZE, 50);

  let cursorDate: Date | undefined;
  if (cursor) {
    const cursorNotif = await prisma.notification.findUnique({ where: { id: cursor } });
    cursorDate = cursorNotif?.createdAt;
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session.user.id,
      ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
  });

  const hasMore = notifications.length === take;

  return NextResponse.json({
    notifications,
    hasMore,
    nextCursor: hasMore ? notifications[notifications.length - 1].id : null,
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  const { id, all } = await req.json();

  if (all) {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });
  } else if (id) {
    await prisma.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { read: true },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  const { id, all } = await req.json();

  if (all) {
    await prisma.notification.deleteMany({ where: { userId: session.user.id, read: true } });
  } else if (id) {
    await prisma.notification.deleteMany({ where: { id, userId: session.user.id } });
  }

  return NextResponse.json({ ok: true });
}
