import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { getAccessibleClientIds } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await requireAuth();
  const clientIds = await getAccessibleClientIds(user.id, user.organizationId, user.role);

  const [clientCount, postCount, accountCount, teamCount] = await Promise.all([
    db.client.count({ where: { id: { in: clientIds } } }),
    db.post.count({ where: { clientId: { in: clientIds } } }),
    db.socialAccount.count({ where: { clientId: { in: clientIds } } }),
    user.role === "ADMIN"
      ? db.user.count({ where: { organizationId: user.organizationId } })
      : Promise.resolve(0),
  ]);

  const recentPosts = await db.post.findMany({
    where: { clientId: { in: clientIds } },
    include: { client: { select: { name: true, color: true } }, author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { title: "Clients", value: clientCount },
    { title: "Social Accounts", value: accountCount },
    { title: "Total Posts", value: postCount },
    ...(user.role === "ADMIN" ? [{ title: "Team Members", value: teamCount }] : []),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{user.name ? `, ${user.name}` : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No posts yet. Create your first post to get started.</p>
          ) : (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-3 text-sm">
                  <div
                    className="h-2 w-2 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: post.client.color || "#6366f1" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{post.content}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {post.client.name} &middot; {post.author.name} &middot; {post.status.toLowerCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
