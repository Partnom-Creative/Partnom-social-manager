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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

export type PostCalendarPost = {
  id: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  client: { name: string; color: string | null };
  targets: { socialAccount: { platform: string } }[];
};

export function PostCalendar({ posts }: { posts: PostCalendarPost[] }) {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-slate-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-t border-l border-slate-200 rounded-lg overflow-hidden">
        {calendarDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayPosts = postsByDate.get(dateKey) || [];
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => handleDayClick(day)}
              className={cn(
                "relative min-h-[80px] border-b border-r border-slate-200 p-1.5 text-left transition-colors hover:bg-slate-50",
                !inMonth && "bg-slate-50/50"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  today && "bg-indigo-600 text-white font-semibold",
                  !today && inMonth && "text-slate-700",
                  !today && !inMonth && "text-slate-400"
                )}
              >
                {format(day, "d")}
              </span>
              {dayPosts.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {dayPosts.slice(0, 4).map((post) => (
                    <span
                      key={post.id}
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: post.client.color || "#6366f1",
                      }}
                    />
                  ))}
                  {dayPosts.length > 4 && (
                    <span className="text-[10px] text-slate-400 leading-none ml-0.5">
                      +{dayPosts.length - 4}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate
                ? format(selectedDate, "EEEE, MMMM d, yyyy")
                : ""}
            </DialogTitle>
          </DialogHeader>
          {selectedDayPosts.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              No posts scheduled for this day.
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedDayPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-lg border border-slate-200 p-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50/30"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: post.client.color || "#6366f1",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-xs text-slate-500">
                          {post.client.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            STATUS_BADGE_CLASSES[post.status]
                          )}
                        >
                          {post.status.toLowerCase()}
                        </Badge>
                        {post.scheduledAt && (
                          <span className="text-xs text-slate-400">
                            {format(new Date(post.scheduledAt), "h:mm a")}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        {post.targets.map((t, i) => (
                          <Badge
                            key={i}
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
                    </div>
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
