import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { getAccessibleClientIds } from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
import type { PostCalendarPost } from "@/components/post-calendar";
import { CalendarScheduledView } from "./calendar-scheduled-view";

export default async function CalendarPage() {
  const user = await requireAuth();
  const clientIds = await getAccessibleClientIds(user.id, user.organizationId, user.role);

  const [calendarPostsRaw, clients] = await Promise.all([
    db.post.findMany({
      where: {
        clientId: { in: clientIds },
        scheduledAt: { not: null },
      },
      select: {
        id: true,
        content: true,
        status: true,
        scheduledAt: true,
        client: { select: { id: true, name: true, color: true } },
        targets: {
          select: { socialAccount: { select: { platform: true } } },
        },
      },
      orderBy: { scheduledAt: "asc" },
      take: 200,
    }),
    db.client.findMany({
      where: { organizationId: user.organizationId, id: { in: clientIds } },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const calendarPosts: PostCalendarPost[] = calendarPostsRaw.map((p) => ({
    id: p.id,
    content: p.content,
    status: p.status,
    scheduledAt: p.scheduledAt?.toISOString() ?? null,
    client: {
      id: p.client.id,
      name: p.client.name,
      color: p.client.color,
    },
    targets: p.targets.map((t) => ({
      socialAccount: { platform: t.socialAccount.platform },
    })),
  }));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground mt-1">Scheduled posts by day</p>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No clients yet. Add a client to schedule posts.</p>
          </CardContent>
        </Card>
      ) : (
        <CalendarScheduledView posts={calendarPosts} clients={clients} />
      )}
    </div>
  );
}
