import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAccess } from "@/lib/permissions";
import { sendClientInviteEmail } from "@/lib/invite-email";
import { getPublicBaseUrl } from "@/lib/public-base-url";
import { AccessLevel, InviteStatus, UserRole } from "@/generated/prisma/client";

async function getInviteForUser(inviteId: string, organizationId: string) {
  const invite = await db.clientInvite.findUnique({
    where: { id: inviteId },
    include: { client: { select: { id: true, name: true, organizationId: true } } },
  });
  if (!invite) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  if (invite.client.organizationId !== organizationId) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { invite };
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inviteId } = await params;
  const orgId = (session.user as { organizationId?: string }).organizationId;
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getInviteForUser(inviteId, orgId);
  if ("error" in result) return result.error;
  const { invite } = result;

  const allowed = await requireAccess(
    session.user.id,
    invite.clientId,
    session.user.role as UserRole,
    AccessLevel.MANAGE
  );
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.clientInvite.delete({ where: { id: inviteId } });
  return NextResponse.json({ success: true });
}

/** Resend invite email (also refreshes expiry for expired invites). */
export async function POST(_req: Request, { params }: { params: Promise<{ inviteId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inviteId } = await params;
  const orgId = (session.user as { organizationId?: string }).organizationId;
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getInviteForUser(inviteId, orgId);
  if ("error" in result) return result.error;
  const { invite } = result;

  const allowed = await requireAccess(
    session.user.id,
    invite.clientId,
    session.user.role as UserRole,
    AccessLevel.MANAGE
  );
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (invite.status === InviteStatus.ACCEPTED) {
    return NextResponse.json({ error: "Invite already accepted" }, { status: 400 });
  }

  const inviteUrl = `${getPublicBaseUrl()}/invite/${invite.token}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const sendResult = await sendClientInviteEmail({
    to: invite.email,
    clientName: invite.client.name,
    inviteUrl,
  });

  if (!sendResult.ok) {
    return NextResponse.json(
      { error: "Could not send email. Check RESEND_API_KEY or try again later." },
      { status: 502 }
    );
  }

  await db.clientInvite.update({
    where: { id: inviteId },
    data: {
      expiresAt,
      status: InviteStatus.PENDING,
    },
  });

  return NextResponse.json({ success: true });
}
