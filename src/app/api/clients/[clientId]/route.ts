import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { clientId } = await params;
  const client = await db.client.findUnique({
    where: { id: clientId },
    include: {
      socialAccounts: {
        select: { id: true, platform: true, accountName: true, accountHandle: true, avatarUrl: true, createdAt: true },
      },
      _count: { select: { posts: true, teamAccess: true, invites: true } },
    },
  });

  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(client);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { clientId } = await params;
  const body = await req.json();

  const client = await db.client.update({
    where: { id: clientId },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.color && { color: body.color }),
    },
  });

  return NextResponse.json(client);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ clientId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { clientId } = await params;
  await db.client.delete({ where: { id: clientId } });

  return NextResponse.json({ success: true });
}
