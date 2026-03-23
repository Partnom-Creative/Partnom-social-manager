import { requireAuth } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AddMemberDialog } from "./add-member-dialog";
import { MemberAccessManager } from "./member-access-manager";

export default async function TeamPage() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") redirect("/");

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

  const clients = await db.client.findMany({
    where: { organizationId: user.organizationId },
    select: { id: true, name: true, color: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground mt-1">Manage team members and their access</p>
        </div>
        <AddMemberDialog />
      </div>

      <div className="space-y-4">
        {members.map((member) => {
          const initials = (member.name || member.email)
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          return (
            <Card key={member.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.name || "Unnamed"}</p>
                      <Badge variant={member.role === "ADMIN" ? "default" : "secondary"}>
                        {member.role.toLowerCase()}
                      </Badge>
                      {member.id === user.id && (
                        <Badge variant="outline">you</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>

                    {member.role === "MEMBER" && (
                      <div className="mt-3">
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
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
