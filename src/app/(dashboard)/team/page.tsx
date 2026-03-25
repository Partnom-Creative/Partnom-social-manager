import { requireAuth } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddMemberDialog } from "./add-member-dialog";
import { MemberAccessManager } from "./member-access-manager";
import { TeamRowActions } from "./team-row-actions";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { listPendingTeamInvites } from "@/lib/team-invite-queries";
import { formatRoleLabel } from "@/lib/format-role";

export default async function TeamPage() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") redirect("/");

  const [members, inviteResult, clients] = await Promise.all([
    db.user.findMany({
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
    }),
    listPendingTeamInvites(user.organizationId),
    db.client.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const invites = inviteResult.invites;
  const teamInvitesUnavailable = inviteResult.teamInvitesUnavailable;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">team</h1>
          <p className="text-muted-foreground mt-1">manage team members and their access</p>
        </div>
        <AddMemberDialog />
      </div>

      <div className="space-y-3">
        {teamInvitesUnavailable && (
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardContent className="py-4 text-sm text-amber-100">
              <p className="font-medium">Team invites can’t load right now</p>
              <p className="mt-1 text-amber-100/80">
                The database client is out of date or migrations weren’t applied. On your machine run:{" "}
                <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">
                  npx prisma generate &amp;&amp; npx prisma migrate deploy
                </code>{" "}
                then redeploy. Inviting new members will fail until this is fixed.
              </p>
            </CardContent>
          </Card>
        )}
        {invites.length === 0 && members.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No team members yet. Invite someone by email to get started.
            </CardContent>
          </Card>
        )}
        {invites.map((invite) => {
          const initials = invite.email
            .split("@")[0]
            .slice(0, 2)
            .toUpperCase()
            .padEnd(2, "·");

          return (
            <Card key={invite.id} className="!gap-0 !p-0">
              <CardContent className="flex items-center gap-3 !px-4 !py-4">
                <Avatar className="h-10 w-10 shrink-0 rounded-lg">
                  <AvatarFallback className="rounded-lg text-sm font-medium">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="font-medium leading-tight truncate">{invite.email}</p>
                  <p className="text-xs leading-tight text-muted-foreground">
                    Sent {format(new Date(invite.createdAt), "MMM d, yyyy")} · Expires{" "}
                    {format(new Date(invite.expiresAt), "MMM d, yyyy")} ·{" "}
                    <span>{formatRoleLabel(invite.role)}</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={invite.status} className="text-xs" />
                  <TeamRowActions variant="invite" inviteId={invite.id} status={invite.status} />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {members.map((member) => {
          const initials = (member.name || member.email)
            .split(/\s+/)
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          const showAccess = member.role === "MEMBER" || member.role === "EDITOR";

          return (
            <Card key={member.id} className="!gap-0 !p-0">
              <CardContent className="!px-4 !py-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0 rounded-lg">
                      <AvatarFallback className="rounded-lg text-sm font-medium">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium leading-tight truncate">{member.name || "Unnamed"}</p>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {formatRoleLabel(member.role)}
                        </Badge>
                        {member.id === user.id && <Badge variant="outline">you</Badge>}
                      </div>
                      <p className="text-xs leading-tight text-muted-foreground mt-0.5 truncate">
                        {member.email}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status="ACTIVE" label="Active" className="text-xs" />
                      <TeamRowActions
                        variant="member"
                        memberId={member.id}
                        currentRole={member.role as "ADMIN" | "EDITOR" | "MEMBER"}
                        isSelf={member.id === user.id}
                        showManageAccess={showAccess}
                      />
                    </div>
                  </div>

                  {showAccess && (
                    <div id={`member-access-${member.id}`} className="min-w-0">
                      <MemberAccessManager
                        memberId={member.id}
                        memberName={member.name || member.email}
                        currentAccess={member.teamAccess.map((ta) => ({
                          clientId: ta.client.id,
                          clientName: ta.client.name,
                          clientColor: ta.client.color || "#6366f1",
                          accessLevel: ta.accessLevel,
                        }))}
                        allClients={clients}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
