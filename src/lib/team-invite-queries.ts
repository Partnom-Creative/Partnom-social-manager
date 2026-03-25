import { db } from "@/lib/db";
import { InviteStatus, type TeamInvite } from "@/generated/prisma/client";

/**
 * Pending team invites for an org. If the Prisma client is stale (e.g. `TeamInvite`
 * was added but `npx prisma generate` / deploy didn't refresh), `db.teamInvite` can
 * be missing and would throw "Cannot read properties of undefined (reading 'findMany')".
 */
export async function listPendingTeamInvites(organizationId: string): Promise<{
  invites: TeamInvite[];
  teamInvitesUnavailable: boolean;
}> {
  const delegate = (db as { teamInvite?: { findMany: (args: unknown) => Promise<TeamInvite[]> } })
    .teamInvite;

  if (!delegate?.findMany) {
    return { invites: [], teamInvitesUnavailable: true };
  }

  const invites = await delegate.findMany({
    where: { organizationId, status: InviteStatus.PENDING },
    orderBy: { createdAt: "desc" },
  });

  return { invites, teamInvitesUnavailable: false };
}
