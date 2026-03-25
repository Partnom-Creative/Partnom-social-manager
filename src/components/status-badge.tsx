import type { ComponentProps } from "react";
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  FilePenLine,
  Loader2,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Post (`PostStatus`) or invite (`InviteStatus`) values.
 * Renders badges with a leading icon per state (uses `plain` variant so hex colors apply in dark mode).
 */
export type PostStatusValue =
  | "DRAFT"
  | "SCHEDULED"
  | "PUBLISHING"
  | "PUBLISHED"
  | "FAILED"
  | "PENDING"
  | "ACCEPTED"
  | "ACTIVE"
  | "EXPIRED";

type StatusConfig = {
  icon: LucideIcon;
  /** Extra classes for the icon (e.g. animate-spin) */
  iconClass?: string;
  /** Added on top of Badge `variant="plain"` */
  className: string;
};

/** User-specified: pending */
const PENDING_BADGE =
  "!border-transparent !bg-[#DDC18D] !text-[#865E13] shadow-none [&_svg]:!text-[#865E13] [&_svg]:opacity-100";

/** User-specified: success / active / positive */
const POSITIVE_BADGE =
  "!border-transparent !bg-[#8DDDA3] !text-[#0A5327] shadow-none [&_svg]:!text-[#0A5327] [&_svg]:opacity-100";

const DRAFT =
  "border-slate-300/80 bg-slate-100/90 text-slate-800 shadow-none dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-200";

const PUBLISHING =
  "border-amber-400/50 bg-amber-500/12 text-amber-950 shadow-none dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100";

const FAILED =
  "border-red-500/40 bg-red-500/10 text-red-800 shadow-none dark:border-red-500/35 dark:bg-red-500/15 dark:text-red-200";

/** Expired = warning / stale (not the same as failed) */
const EXPIRED_INVITE =
  "border-orange-400/45 bg-orange-500/12 text-orange-950 shadow-none dark:border-orange-500/35 dark:bg-orange-500/15 dark:text-orange-100";

const STATUS_MAP: Record<string, StatusConfig> = {
  DRAFT: {
    icon: FilePenLine,
    className: DRAFT,
  },
  SCHEDULED: {
    icon: CalendarClock,
    className: POSITIVE_BADGE,
  },
  PUBLISHING: {
    icon: Loader2,
    iconClass: "animate-spin",
    className: PUBLISHING,
  },
  PUBLISHED: {
    icon: CheckCircle2,
    className: POSITIVE_BADGE,
  },
  FAILED: {
    icon: XCircle,
    className: FAILED,
  },
  PENDING: {
    icon: CircleDot,
    className: PENDING_BADGE,
  },
  ACCEPTED: {
    icon: CheckCircle2,
    className: POSITIVE_BADGE,
  },
  /** Team member account — active in org */
  ACTIVE: {
    icon: CheckCircle2,
    className: POSITIVE_BADGE,
  },
  EXPIRED: {
    icon: Ban,
    className: EXPIRED_INVITE,
  },
};

const FALLBACK: StatusConfig = {
  icon: CircleDot,
  className:
    "border-border bg-muted/40 text-muted-foreground shadow-none dark:bg-muted/25",
};

export function formatPostStatusLabel(status: string): string {
  if (!status) return "";
  const s = status.toUpperCase();
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export type StatusBadgeProps = Omit<
  ComponentProps<typeof Badge>,
  "variant" | "children"
> & {
  status: string;
  /** Override label (defaults to title-cased status) */
  label?: string;
};

export function StatusBadge({
  status,
  label,
  className,
  ...props
}: StatusBadgeProps) {
  const key = status.toUpperCase();
  const config = STATUS_MAP[key] ?? FALLBACK;
  const Icon = config.icon;

  return (
    <Badge
      variant="plain"
      className={cn(
        "gap-1.5 pr-2.5 pl-1.5 font-normal tabular-nums",
        config.className,
        className
      )}
      {...props}
    >
      <Icon
        className={cn("size-3 shrink-0", config.iconClass)}
        aria-hidden
      />
      {label ?? formatPostStatusLabel(status)}
    </Badge>
  );
}
