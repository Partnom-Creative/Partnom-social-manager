import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { getAccessibleClientIds } from "@/lib/permissions";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PostFilters } from "./post-filters";
import { PostsView } from "./posts-view";

const POSTS_PER_PAGE = 20;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{
    client?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const accessibleIds = await getAccessibleClientIds(user.id, user.organizationId, user.role);
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const baseWhere: Record<string, unknown> = {
    clientId: { in: accessibleIds },
  };
  if (params.client && accessibleIds.includes(params.client)) {
    baseWhere.clientId = params.client;
  }
  if (params.status) {
    baseWhere.status = params.status;
  }

  const listWhere: Record<string, unknown> = { ...baseWhere };
  if (params.from || params.to) {
    const scheduledAtFilter: Record<string, Date> = {};
    if (params.from) scheduledAtFilter.gte = new Date(params.from);
    if (params.to) scheduledAtFilter.lte = new Date(params.to + "T23:59:59");
    listWhere.scheduledAt = scheduledAtFilter;
  }

  const calendarWhere = { ...baseWhere, scheduledAt: { not: null } };

  const [posts, totalCount, calendarPostsRaw, clients] = await Promise.all([
    db.post.findMany({
      where: listWhere,
      include: {
        client: { select: { id: true, name: true, color: true, slug: true } },
        author: { select: { id: true, name: true } },
        targets: {
          include: {
            socialAccount: {
              select: {
                id: true,
                platform: true,
                accountName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    }),
    db.post.count({ where: listWhere }),
    db.post.findMany({
      where: calendarWhere,
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
      where: {
        organizationId: user.organizationId,
        id: { in: accessibleIds },
      },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  const calendarPosts = calendarPostsRaw.map((p) => ({
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage social media posts
          </p>
        </div>
        <Link
          href="/posts/new"
          className={cn(buttonVariants({ variant: "brand" }))}
        >
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      <Suspense>
        <PostFilters clients={clients} />
      </Suspense>

      <PostsView
        posts={posts}
        calendarPosts={calendarPosts}
        currentPage={page}
        totalPages={totalPages}
        searchParams={params}
      />
    </div>
  );
}
