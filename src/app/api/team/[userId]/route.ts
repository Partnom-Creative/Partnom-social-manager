import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;

  if (userId === (session.user as any).id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  await db.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
