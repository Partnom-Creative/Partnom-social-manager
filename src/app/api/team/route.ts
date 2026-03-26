import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPublicBaseUrl } from "@/lib/public-base-url";
import { sendTeamInviteEmail } from "@/lib/team-invite-email";
import { InviteStatus, UserRole } from "@/generated/prisma/client";

function errorToMessage(err: unknown) {
  if (!err) return "Unknown error";
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

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

/** Create a team invite (email with link to set password). */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = session.user as any;
  if (admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, role } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const inviteRole =
    role === "ADMIN" ? UserRole.ADMIN : role === "EDITOR" ? UserRole.EDITOR : null;
  if (!inviteRole) {
    return NextResponse.json({ error: "Role must be ADMIN or EDITOR" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const pending = await db.teamInvite.findFirst({
    where: {
      organizationId: admin.organizationId,
      email: normalizedEmail,
      status: InviteStatus.PENDING,
    },
  });
  if (pending) {
    return NextResponse.json({ error: "An invitation is already pending for this email" }, { status: 409 });
  }

  const org = await db.organization.findUnique({
    where: { id: admin.organizationId },
    select: { name: true },
  });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invite = await db.teamInvite.create({
    data: {
      email: normalizedEmail,
      token,
      expiresAt,
      organizationId: admin.organizationId,
      role: inviteRole,
    },
  });

  const inviteUrl = `${getPublicBaseUrl()}/team/join/${token}`;

  const sendResult = await sendTeamInviteEmail({
    to: normalizedEmail,
    organizationName: org.name,
    inviteUrl,
  });

  if (!sendResult.ok) {
    await db.teamInvite.delete({ where: { id: invite.id } });
    const providerMessage = errorToMessage(sendResult.error);
    return NextResponse.json(
      {
        error:
          `Could not send invite email via Resend. ` +
          `Check RESEND_API_KEY (and RESEND_FROM / verified domain). ` +
          `Provider message: ${providerMessage}`,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ id: invite.id, email: invite.email, role: invite.role }, { status: 201 });
}
