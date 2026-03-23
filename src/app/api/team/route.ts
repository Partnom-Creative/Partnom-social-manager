import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const members = await db.user.findMany({
    where: { organizationId: user.organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      teamAccess: {
        include: { client: { select: { id: true, name: true, color: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(members);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, email, password, role } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const hashedPassword = await hash(password, 12);
  const member = await db.user.create({
    data: {
      name,
      email,
      hashedPassword,
      role: role === "ADMIN" ? "ADMIN" : "MEMBER",
      organizationId: user.organizationId,
    },
  });

  return NextResponse.json({ id: member.id, name: member.name, email: member.email, role: member.role }, { status: 201 });
}
