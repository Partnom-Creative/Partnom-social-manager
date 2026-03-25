"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { PenSquare, Plus, CalendarDays, List } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { PostCalendar, type PostCalendarPost } from "@/components/post-calendar";
import { cn } from "@/lib/utils";

const PLATFORM_BADGE_CLASSES: Record<string, string> = {
  TWITTER: "bg-slate-900 text-white border-slate-900",
  LINKEDIN: "bg-blue-600 text-white border-blue-600",
  YOUTUBE: "bg-red-600 text-white border-red-600",
  INSTAGRAM: "bg-pink-600 text-white border-pink-600",
  SUBSTACK: "bg-orange-600 text-white border-orange-600",
};

type PostRow = {
  id: string;
  content: string;
  status: string;
  scheduledAt: Date | null;
  client: {
    id: string;
    name: string;
    color: string | null;
    slug: string;
  };
  author: { id: string; name: string | null };
  targets: {
    id: string;
    socialAccount: {
      id: string;
      platform: string;
      accountName: string | null;
    };
  }[];
};

type PostsViewProps = {
  posts: PostRow[];
  calendarPosts: PostCalendarPost[];
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

export function PostsView({
  posts,
  calendarPosts,
  currentPage,
  totalPages,
  searchParams,
}: PostsViewProps) {
  const [view, setView] = useState<"list" | "calendar">("list");

  function buildPageUrl(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    params.set("page", page.toString());
    return `/posts?${params.toString()}`;
  }

  return (
    <Card className="gap-0 overflow-hidden pt-2 pb-0">
      <CardHeader className="flex flex-row items-center justify-end space-y-0 border-b py-3">
        <div className="flex items-center gap-1 rounded-[min(var(--radius-md),10px)] border border-border bg-muted/50 p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "size-8",
              view === "list"
                ? "bg-background text-foreground shadow-sm dark:bg-input/40"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            aria-label="List view"
            title="List view"
          >
            <List className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "size-8",
              view === "calendar"
                ? "bg-background text-foreground shadow-sm dark:bg-input/40"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
            onClick={() => setView("calendar")}
            aria-pressed={view === "calendar"}
            aria-label="Calendar view"
            title="Calendar view"
          >
            <CalendarDays className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {view === "list" ? (
          posts.length === 0 ? (
            <div className="py-12 text-center px-4">
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
            </div>
          ) : (
            <>
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
                          className="text-sm text-foreground hover:text-primary transition-colors line-clamp-2 block"
                        >
                          {post.content}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{
                              backgroundColor: post.client.color || "#6366f1",
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
                                PLATFORM_BADGE_CLASSES[t.socialAccount.platform]
                              )}
                            >
                              {t.socialAccount.platform.toLowerCase()}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={post.status} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {post.scheduledAt
                            ? format(
                                new Date(post.scheduledAt),
                                "MMM d, h:mm a"
                              )
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {post.author.name || "Unknown"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4 border-t">
                  {currentPage > 1 ? (
                    <Link href={buildPageUrl(currentPage - 1)}>
                      <Button variant="outline" size="sm">
                        Previous
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Previous
                    </Button>
                  )}
                  <span className="text-sm text-muted-foreground px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  {currentPage < totalPages ? (
                    <Link href={buildPageUrl(currentPage + 1)}>
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
              )}
            </>
          )
        ) : (
          <PostCalendar posts={calendarPosts} />
        )}
      </CardContent>
    </Card>
  );
}
