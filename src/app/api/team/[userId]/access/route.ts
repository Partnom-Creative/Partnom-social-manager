import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;
  const { clientId, accessLevel } = await req.json();

  if (!clientId || !accessLevel) {
    return NextResponse.json({ error: "clientId and accessLevel are required" }, { status: 400 });
  }

  const access = await db.teamAccess.upsert({
    where: { userId_clientId: { userId, clientId } },
    create: { userId, clientId, accessLevel },
    update: { accessLevel },
  });

  return NextResponse.json(access);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  await db.teamAccess.deleteMany({ where: { userId, clientId } });
  return NextResponse.json({ success: true });
}
