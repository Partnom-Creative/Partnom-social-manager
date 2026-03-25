import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPublicBaseUrl } from "@/lib/public-base-url";
import { sendTeamInviteEmail } from "@/lib/team-invite-email";
import { InviteStatus } from "@/generated/prisma/client";

async function getOrgSession() {
  const session = await auth();
  if (!session?.user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const u = session.user as { id: string; role: string; organizationId: string };
  if (u.role !== "ADMIN") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user: u };
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ inviteId: string }> }) {
  const s = await getOrgSession();
  if ("error" in s) return s.error;
  const { inviteId } = await params;

  const invite = await db.teamInvite.findFirst({
    where: { id: inviteId, organizationId: s.user.organizationId },
  });
  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.teamInvite.delete({ where: { id: inviteId } });
  return NextResponse.json({ success: true });
}

/** Resend invite email; refreshes expiry */
export async function POST(_req: Request, { params }: { params: Promise<{ inviteId: string }> }) {
  const s = await getOrgSession();
  if ("error" in s) return s.error;
  const { inviteId } = await params;

  const invite = await db.teamInvite.findFirst({
    where: { id: inviteId, organizationId: s.user.organizationId },
    include: { organization: { select: { name: true } } },
  });
  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invite.status === InviteStatus.ACCEPTED) {
    return NextResponse.json({ error: "Invite already accepted" }, { status: 400 });
  }

  const inviteUrl = `${getPublicBaseUrl()}/team/join/${invite.token}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const sendResult = await sendTeamInviteEmail({
    to: invite.email,
    organizationName: invite.organization.name,
    inviteUrl,
  });
  if (!sendResult.ok) {
    return NextResponse.json(
      { error: "Could not send email. Check RESEND_API_KEY or try again later." },
      { status: 502 }
    );
  }

  await db.teamInvite.update({
    where: { id: inviteId },
    data: { expiresAt, status: InviteStatus.PENDING },
  });

  return NextResponse.json({ success: true });
}
