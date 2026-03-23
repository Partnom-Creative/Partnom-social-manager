import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { getAccessibleClientIds } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function CalendarPage() {
  const user = await requireAuth();
  const clientIds = await getAccessibleClientIds(user.id, user.organizationId, user.role);

  const scheduledPosts = await db.post.findMany({
    where: {
      clientId: { in: clientIds },
      status: "SCHEDULED",
      scheduledAt: { not: null },
    },
    include: {
      client: { select: { name: true, color: true } },
      targets: { include: { socialAccount: { select: { platform: true, accountName: true } } } },
    },
    orderBy: { scheduledAt: "asc" },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground mt-1">Scheduled posts timeline</p>
      </div>

      {scheduledPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No scheduled posts. Create a post and schedule it for later.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scheduledPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: post.client.color || "#6366f1" }}
                  />
                  <CardTitle className="text-base">{post.client.name}</CardTitle>
                  <Badge variant="secondary" className="ml-auto">
                    {post.scheduledAt ? format(new Date(post.scheduledAt), "MMM d, yyyy h:mm a") : ""}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-2">{post.content}</p>
                <div className="flex gap-1.5 mt-2">
                  {post.targets.map((t) => (
                    <Badge key={t.id} variant="outline" className="text-xs">
                      {t.socialAccount.platform.toLowerCase()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
