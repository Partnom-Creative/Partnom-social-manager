"use client";

import Link from "next/link";
import { PostCalendar, type PostCalendarPost } from "@/components/post-calendar";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Same shell as the calendar view on `/posts` (list/calendar toggle → calendar).
 */
export function ClientScheduledCalendar({
  posts,
  clientId,
}: {
  posts: PostCalendarPost[];
  clientId: string;
}) {
  return (
    <Card className="gap-0 overflow-hidden pt-2 pb-0">
      {posts.length === 0 && (
        <div className="border-b px-4 py-3 text-center text-sm text-muted-foreground">
          No scheduled posts yet.{" "}
          <Link
            href={`/posts/new?client=${clientId}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Schedule a post
          </Link>
        </div>
      )}
      <CardContent className="p-0">
        <PostCalendar posts={posts} />
      </CardContent>
    </Card>
  );
}
