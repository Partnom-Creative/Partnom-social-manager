"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Client = {
  id: string;
  name: string;
  color: string | null;
};

const STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHING", "PUBLISHED", "FAILED"];

export function PostFilters({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs text-slate-500">Client</Label>
        <Select
          value={searchParams.get("client") || "__all__"}
          onValueChange={(v) =>
            updateParams({ client: !v || v === "__all__" ? null : v })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All clients</SelectItem>
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
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-slate-500">Status</Label>
        <Select
          value={searchParams.get("status") || "__all__"}
          onValueChange={(v) =>
            updateParams({ status: !v || v === "__all__" ? null : v })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-slate-500">From</Label>
        <Input
          type="date"
          value={searchParams.get("from") || ""}
          onChange={(e) => updateParams({ from: e.target.value || null })}
          className="w-[160px]"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-slate-500">To</Label>
        <Input
          type="date"
          value={searchParams.get("to") || ""}
          onChange={(e) => updateParams({ to: e.target.value || null })}
          className="w-[160px]"
        />
      </div>
    </div>
  );
}
