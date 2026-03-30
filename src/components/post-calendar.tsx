"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PLATFORM_BADGE_CLASSES: Record<string, string> = {
  TWITTER: "bg-slate-900 text-white border-slate-900",
  LINKEDIN: "bg-blue-600 text-white border-blue-600",
  YOUTUBE: "bg-red-600 text-white border-red-600",
  INSTAGRAM: "bg-pink-600 text-white border-pink-600",
  SUBSTACK: "bg-orange-600 text-white border-orange-600",
};

/** Truncate post body for pill preview */
function postTitlePreview(content: string, max = 22) {
  const t = content.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export type PostCalendarPost = {
  id: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  client: { id: string; name: string; color: string | null };
  targets: { socialAccount: { platform: string } }[];
};

function PillShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex min-w-0 max-w-full items-center gap-1.5 rounded-full px-2 py-0.5",
        "bg-purple-500/12 ring-1 ring-purple-500/25 dark:bg-[#2d1b33]/90 dark:ring-purple-950/50",
        className
      )}
    >
      {children}
    </span>
  );
}

function ScheduledPostPill({
  post,
  className,
}: {
  post: PostCalendarPost;
  className?: string;
}) {
  return (
    <Link
      href={`/posts/${post.id}`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className={cn(
        "flex min-w-0 max-w-full items-center gap-1.5 rounded-full px-2 py-0.5 transition-opacity hover:opacity-90",
        "bg-purple-500/12 ring-1 ring-purple-500/25 dark:bg-[#2d1b33]/90 dark:ring-purple-950/50",
        className
      )}
    >
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-purple-300 dark:bg-purple-400">
        <Star className="size-2.5 fill-purple-900 text-purple-900 dark:fill-zinc-950 dark:text-zinc-950" strokeWidth={0} />
      </span>
      <span className="truncate text-[10px] font-medium leading-tight text-purple-900 dark:text-purple-200">
        {postTitlePreview(post.content)}
      </span>
    </Link>
  );
}

export function PostCalendar({
  posts,
  className,
  fillHeight = false,
}: {
  posts: PostCalendarPost[];
  /** Stretch calendar grid to fill parent height (use with flex parent + min-h-0). */
  fillHeight?: boolean;
  className?: string;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const postsByDate = useMemo(() => {
    const map = new Map<string, PostCalendarPost[]>();
    for (const post of posts) {
      if (!post.scheduledAt) continue;
      const dateKey = format(new Date(post.scheduledAt), "yyyy-MM-dd");
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(post);
    }
    return map;
  }, [posts]);

  const selectedDayPosts = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return postsByDate.get(dateKey) || [];
  }, [selectedDate, postsByDate]);

  function handleDayClick(day: Date) {
    setSelectedDate(day);
    setDialogOpen(true);
  }

  const weekLetters = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div
      className={cn(
        "flex flex-col rounded-t-none rounded-b-2xl bg-card p-4 text-card-foreground ring-1 ring-border md:p-5",
        fillHeight && "min-h-0 flex-1",
        className
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-col gap-3",
          fillHeight && "min-h-0 flex-1"
        )}
      >
        <div className="flex shrink-0 items-center justify-between">
          <h3 className="m-0 text-base font-medium leading-tight tracking-tight text-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "flex min-h-0 flex-col gap-0",
            fillHeight && "min-h-0 flex-1"
          )}
        >
          <div className="grid grid-cols-7 border-b border-border pb-2">
            {weekLetters.map((letter, i) => (
              <div key={`${letter}-${i}`} className="px-1 py-1.5">
                <div className="flex shrink-0 items-center gap-1.5 self-start">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-medium tabular-nums",
                      i === 6 ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground"
                    )}
                  >
                    {letter}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "grid min-h-0 grid-cols-7 gap-y-1 pt-1",
              fillHeight && "flex-1 [grid-auto-rows:minmax(0,1fr)]"
            )}
          >
        {calendarDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayPosts = postsByDate.get(dateKey) || [];
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const isSelected =
            selectedDate != null && isSameDay(day, selectedDate);

          const showPills = dayPosts.length > 0;
          const maxPills = 2;
          const visiblePosts = dayPosts.slice(0, maxPills);
          const overflow = dayPosts.length - visiblePosts.length;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => handleDayClick(day)}
              className={cn(
                "group flex h-full min-h-0 w-full flex-col items-start gap-1 rounded-lg px-1 py-1.5 text-left transition-colors",
                showPills
                  ? fillHeight
                    ? "min-h-0 pb-1.5 pt-1"
                    : "min-h-[92px] pb-1.5 pt-1"
                  : fillHeight
                    ? "min-h-0 justify-start pb-1.5 pt-1"
                    : "min-h-[48px] justify-start pb-1.5 pt-1",
                "hover:bg-muted/80",
                !inMonth && "opacity-35",
                isSelected && "ring-1 ring-sky-500/40 ring-inset dark:ring-sky-400/35"
              )}
            >
              <div className="flex shrink-0 items-center gap-1.5 self-start">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg text-xs tabular-nums",
                    today &&
                      "bg-sky-400/35 font-medium text-sky-950 shadow-none dark:bg-sky-400/45 dark:text-sky-950",
                    !today && inMonth && "text-foreground",
                    !today && !inMonth && "text-muted-foreground",
                    isSelected &&
                      !today &&
                      "ring-1 ring-sky-500/55 ring-offset-2 ring-offset-background dark:ring-sky-400/50"
                  )}
                >
                  {format(day, "d")}
                </span>
                {showPills && (
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-teal-600 dark:bg-teal-400"
                    aria-hidden
                  />
                )}
              </div>

              {showPills && (
                <div className="flex min-h-0 w-full flex-1 flex-col items-stretch gap-1 overflow-hidden">
                  {visiblePosts.map((post) => (
                    <ScheduledPostPill key={post.id} post={post} />
                  ))}
                  {overflow > 0 && (
                    <span className="text-left text-[10px] text-muted-foreground">
                      +{overflow} more
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border bg-background text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {selectedDate
                ? format(selectedDate, "EEEE, MMMM d, yyyy")
                : ""}
            </DialogTitle>
          </DialogHeader>
          {selectedDayPosts.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No posts scheduled for this day.
            </p>
          ) : (
            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {selectedDayPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-xl border border-border bg-muted/40 p-3 transition-colors hover:border-purple-500/35 hover:bg-muted dark:hover:border-purple-900/60 dark:hover:bg-muted/80"
                >
                  <PillShell className="mb-3 w-full">
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-purple-300 dark:bg-purple-400">
                      <Star className="size-2.5 fill-purple-900 text-purple-900 dark:fill-zinc-950 dark:text-zinc-950" strokeWidth={0} />
                    </span>
                    <span className="truncate text-[10px] font-medium leading-tight text-purple-900 dark:text-purple-200">
                      {postTitlePreview(post.content, 40)}
                    </span>
                  </PillShell>
                  <p className="text-sm leading-snug text-foreground/90 line-clamp-3">
                    {post.content}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {post.client.name}
                    </span>
                    <StatusBadge
                      status={post.status}
                      className="text-[10px]"
                    />
                    {post.scheduledAt && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(post.scheduledAt), "h:mm a")}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.targets.map((t, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          PLATFORM_BADGE_CLASSES[t.socialAccount.platform]
                        )}
                      >
                        {t.socialAccount.platform.toLowerCase()}
                      </Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
