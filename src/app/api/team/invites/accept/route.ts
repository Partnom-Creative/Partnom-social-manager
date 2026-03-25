import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { InviteStatus } from "@/generated/prisma/client";

export async function POST(req: Request) {
  const body = await req.json();
  const { token, password, name } = body as { token?: string; password?: string; name?: string };

  if (!token || !password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Token and password (min 8 characters) are required" }, { status: 400 });
  }

  const invite = await db.teamInvite.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invite) return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  if (invite.status === InviteStatus.ACCEPTED) {
    return NextResponse.json({ error: "Invite already used" }, { status: 400 });
  }
  if (invite.expiresAt < new Date()) {
    await db.teamInvite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.EXPIRED },
    });
    return NextResponse.json({ error: "Invite expired" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email: invite.email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const hashedPassword = await hash(password, 12);
  const displayName = typeof name === "string" && name.trim() ? name.trim() : invite.email.split("@")[0];

  await db.$transaction([
    db.user.create({
      data: {
        email: invite.email,
        name: displayName,
        hashedPassword,
        role: invite.role,
        organizationId: invite.organizationId,
      },
    }),
    db.teamInvite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.ACCEPTED },
    }),
  ]);

  return NextResponse.json({ success: true, email: invite.email });
}
