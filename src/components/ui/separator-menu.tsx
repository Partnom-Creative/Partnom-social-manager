"use client";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/** Shadcn-style row with vertical separators (e.g. settings overview). */
export function SeparatorMenu({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm md:gap-4",
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-medium">Settings</span>
        <span className="text-xs text-muted-foreground">Manage preferences</span>
      </div>
      <Separator orientation="vertical" className="h-10 shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-medium">Account</span>
        <span className="text-xs text-muted-foreground">Profile & security</span>
      </div>
      <Separator orientation="vertical" className="hidden h-10 shrink-0 md:block" />
      <div className="hidden min-w-0 flex-col gap-1 md:flex">
        <span className="font-medium">Help</span>
        <span className="text-xs text-muted-foreground">Support & docs</span>
      </div>
    </div>
  );
}

/** Same separator pattern for client cards: accounts / posts / members. */
export function ClientCardSeparatorMenu({
  accounts,
  posts,
  members,
  className,
}: {
  accounts: number;
  posts: number;
  members: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-stretch gap-2 text-sm md:gap-4",
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-medium tabular-nums">{accounts}</span>
        <span className="text-xs text-muted-foreground">accounts</span>
      </div>
      <Separator orientation="vertical" className="h-auto min-h-10 shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-medium tabular-nums">{posts}</span>
        <span className="text-xs text-muted-foreground">posts</span>
      </div>
      <Separator orientation="vertical" className="h-auto min-h-10 shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-medium tabular-nums">{members}</span>
        <span className="text-xs text-muted-foreground">members</span>
      </div>
    </div>
  );
}
