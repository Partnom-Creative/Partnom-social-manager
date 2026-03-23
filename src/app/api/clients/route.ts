import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;

  let clients;
  if (user.role === "ADMIN") {
    clients = await db.client.findMany({
      where: { organizationId: user.organizationId },
      include: {
        socialAccounts: { select: { id: true, platform: true, accountName: true, accountHandle: true } },
        _count: { select: { posts: true, teamAccess: true } },
      },
      orderBy: { name: "asc" },
    });
  } else {
    const access = await db.teamAccess.findMany({
      where: { userId: user.id },
      select: { clientId: true },
    });
    clients = await db.client.findMany({
      where: { id: { in: access.map((a) => a.clientId) } },
      include: {
        socialAccounts: { select: { id: true, platform: true, accountName: true, accountHandle: true } },
        _count: { select: { posts: true, teamAccess: true } },
      },
      orderBy: { name: "asc" },
    });
  }

  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, color } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const client = await db.client.create({
    data: {
      name,
      slug: slug + "-" + Date.now().toString(36),
      color: color || "#6366f1",
      organizationId: user.organizationId,
    },
  });

  return NextResponse.json(client, { status: 201 });
}
