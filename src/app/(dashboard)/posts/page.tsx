import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { getAccessibleClientIds } from "@/lib/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { PenSquare, Plus, CalendarDays, List } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Suspense } from "react";
import { PostFilters } from "./post-filters";
import { PostCalendar } from "@/components/post-calendar";
import { cn } from "@/lib/utils";

const POSTS_PER_PAGE = 20;

const STATUS_BADGE_CLASSES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  SCHEDULED: "bg-amber-50 text-amber-700 border-amber-200",
  PUBLISHING: "bg-blue-50 text-blue-700 border-blue-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

const PLATFORM_BADGE_CLASSES: Record<string, string> = {
  TWITTER: "bg-slate-900 text-white border-slate-900",
  LINKEDIN: "bg-blue-600 text-white border-blue-600",
  YOUTUBE: "bg-red-600 text-white border-red-600",
  INSTAGRAM: "bg-pink-600 text-white border-pink-600",
  SUBSTACK: "bg-orange-600 text-white border-orange-600",
};

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
              select: { id: true, platform: true, accountName: true },
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
        client: { select: { name: true, color: true } },
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
    client: { name: p.client.name, color: p.client.color },
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
        <Link href="/posts/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <Suspense>
        <PostFilters clients={clients} />
      </Suspense>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-1.5" />
            List
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarDays className="h-4 w-4 mr-1.5" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <PenSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No posts found. Create your first post to get started.
                </p>
                <Link href="/posts/new" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                    Create Post
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Content</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Platforms</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Author</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="max-w-[300px]">
                          <Link
                            href={`/posts/${post.id}`}
                            className="text-sm text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 block"
                          >
                            {post.content}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{
                                backgroundColor:
                                  post.client.color || "#6366f1",
                              }}
                            />
                            <span className="text-sm whitespace-nowrap">
                              {post.client.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {post.targets.map((t) => (
                              <Badge
                                key={t.id}
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1.5 py-0",
                                  PLATFORM_BADGE_CLASSES[
                                    t.socialAccount.platform
                                  ]
                                )}
                              >
                                {t.socialAccount.platform.toLowerCase()}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              STATUS_BADGE_CLASSES[post.status]
                            )}
                          >
                            {post.status.charAt(0) +
                              post.status.slice(1).toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-500 whitespace-nowrap">
                            {post.scheduledAt
                              ? format(
                                  new Date(post.scheduledAt),
                                  "MMM d, h:mm a"
                                )
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-500 whitespace-nowrap">
                            {post.author.name || "Unknown"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  searchParams={params}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="pt-6">
              <PostCalendar posts={calendarPosts} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  function buildUrl(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    params.set("page", page.toString());
    return `/posts?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      {currentPage > 1 ? (
        <Link href={buildUrl(currentPage - 1)}>
          <Button variant="outline" size="sm">
            Previous
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}
      <span className="text-sm text-slate-500 px-2">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages ? (
        <Link href={buildUrl(currentPage + 1)}>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </Link>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </div>
  );
}
