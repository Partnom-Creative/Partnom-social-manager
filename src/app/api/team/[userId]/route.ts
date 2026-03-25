import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@/generated/prisma/client";

export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = session.user as { id: string; role: string; organizationId: string };
  if (admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;
  const { role } = await req.json();

  const nextRole = role === "ADMIN" ? UserRole.ADMIN : role === "EDITOR" ? UserRole.EDITOR : null;
  if (!nextRole) {
    return NextResponse.json({ error: "Role must be ADMIN or EDITOR" }, { status: 400 });
  }

  if (userId === admin.id) {
    return NextResponse.json({ error: "Cannot change your own role here" }, { status: 400 });
  }

  const target = await db.user.findFirst({
    where: { id: userId, organizationId: admin.organizationId },
  });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.user.update({
    where: { id: userId },
    data: { role: nextRole },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;

  if (userId === (session.user as any).id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  const target = await db.user.findFirst({
    where: { id: userId, organizationId: (session.user as any).organizationId },
  });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
