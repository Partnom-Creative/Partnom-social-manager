"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { PostCalendar, type PostCalendarPost } from "@/components/post-calendar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type ClientOption = { id: string; name: string; color: string | null };

export function CalendarScheduledView({
  posts,
  clients,
}: {
  posts: PostCalendarPost[];
  clients: ClientOption[];
}) {
  /** Client IDs whose posts are visible. Default = all clients selected. */
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => new Set(clients.map((c) => c.id)));

  const filteredPosts = useMemo(() => {
    if (visibleIds.size === 0) return [];
    if (visibleIds.size === clients.length) return posts;
    return posts.filter((p) => visibleIds.has(p.client.id));
  }, [posts, visibleIds, clients.length]);

  const allSelected = clients.length > 0 && visibleIds.size === clients.length;
  const label =
    clients.length === 0
      ? "No clients"
      : allSelected
        ? "All clients"
        : visibleIds.size === 0
          ? "None"
          : `${visibleIds.size} selected`;

  function toggle(id: string) {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setVisibleIds(new Set(clients.map((c) => c.id)));
  }

  function clearAll() {
    setVisibleIds(new Set());
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Show scheduled posts for</span>
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" size="sm" className="gap-2" disabled={clients.length === 0}>
                <Filter className="size-3.5" />
                {label}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-80">
            <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
              <p className="text-xs font-medium text-muted-foreground">Clients</p>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAll}>
                  All
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={clearAll}>
                  None
                </Button>
              </div>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto pt-2">
              {clients.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted/60"
                >
                  <Checkbox
                    checked={visibleIds.has(c.id)}
                    onCheckedChange={() => toggle(c.id)}
                  />
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color || "#6366f1" }}
                  />
                  <span className="truncate text-sm">{c.name}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {visibleIds.size === 0 && clients.length > 0 && (
        <p className="text-sm text-amber-600 dark:text-amber-500">
          Select at least one client to show scheduled posts on the calendar.
        </p>
      )}
      <div className="flex min-h-0 flex-1 flex-col">
        <PostCalendar posts={filteredPosts} fillHeight className="min-h-0 flex-1" />
      </div>
    </div>
  );
}
