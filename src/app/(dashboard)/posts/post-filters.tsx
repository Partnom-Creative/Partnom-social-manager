"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/ui/date-range-picker";

type Client = {
  id: string;
  name: string;
  color: string | null;
};

const STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHING", "PUBLISHED", "FAILED"] as const;

/** Sentinel for "no filter" — avoids `__all__` showing in the trigger. */
const ALL = "all";

const POST_STATUS_LABEL: Record<(typeof STATUSES)[number], string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHING: "Publishing",
  PUBLISHED: "Published",
  FAILED: "Failed",
};

function normalizeClientParam(raw: string | null) {
  if (!raw || raw === "__all__") return ALL;
  return raw;
}

function normalizeStatusParam(raw: string | null) {
  if (!raw || raw === "__all__") return ALL;
  return raw;
}

export function PostFilters({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const clientValue = normalizeClientParam(searchParams.get("client"));
  const statusValue = normalizeStatusParam(searchParams.get("status"));

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-wrap items-start gap-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Client</Label>
        <Select
          value={clientValue}
          onValueChange={(v) =>
            updateParams({ client: !v || v === ALL ? null : v })
          }
        >
          <SelectTrigger className="w-full max-w-[180px] border-border text-foreground">
            <SelectValue placeholder="All clients">
              {(value) =>
                value === ALL
                  ? "All clients"
                  : clients.find((c) => c.id === value)?.name ?? "All clients"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Clients</SelectLabel>
              <SelectItem value={ALL}>All clients</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: c.color || "#6366f1" }}
                    />
                    {c.name}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Status</Label>
        <Select
          value={statusValue}
          onValueChange={(v) =>
            updateParams({ status: !v || v === ALL ? null : v })
          }
        >
          <SelectTrigger className="w-full max-w-[160px] border-border text-foreground">
            <SelectValue placeholder="All statuses">
              {(value) =>
                value === ALL
                  ? "All statuses"
                  : POST_STATUS_LABEL[value as keyof typeof POST_STATUS_LABEL] ??
                    String(value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {POST_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1 w-[min(100%,18rem)]">
        <Label
          htmlFor="posts-scheduled-range"
          className="text-xs text-muted-foreground"
        >
          Scheduled
        </Label>
        <DateRangePicker
          id="posts-scheduled-range"
          from={searchParams.get("from") || ""}
          to={searchParams.get("to") || ""}
          onRangeChange={(from, to) => updateParams({ from, to })}
          placeholder="Pick a date range"
          className="w-full"
        />
      </div>
    </div>
  );
}
