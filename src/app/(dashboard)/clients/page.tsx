import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { getAccessibleClientIds } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientCardSeparatorMenu } from "@/components/ui/separator-menu";
import Link from "next/link";
import { CreateClientDialog } from "./create-client-dialog";

export default async function ClientsPage() {
  const user = await requireAuth();
  const clientIds = await getAccessibleClientIds(user.id, user.organizationId, user.role);

  const clients = await db.client.findMany({
    where: { id: { in: clientIds } },
    include: {
      socialAccounts: { select: { id: true, platform: true } },
      _count: { select: { posts: true, teamAccess: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your agency&apos;s clients</p>
        </div>
        {user.role === "ADMIN" && <CreateClientDialog />}
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No clients yet. Add your first client to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link key={client.id} href={`/clients/${client.slug}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: client.color || "#6366f1" }}
                    >
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ClientCardSeparatorMenu
                    accounts={client.socialAccounts.length}
                    posts={client._count.posts}
                    members={client._count.teamAccess}
                  />
                  {client.socialAccounts.length > 0 && (
                    <div className="flex gap-1.5 mt-3">
                      {[...new Set(client.socialAccounts.map((a) => a.platform))].map((p) => (
                        <Badge key={p} variant="secondary" className="text-xs">
                          {p.toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
