"use client";

import * as React from "react";
import { format, parseISO, isValid } from "date-fns";
import { type DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function parseYmd(s: string | null | undefined): Date | undefined {
  if (!s?.trim()) return undefined;
  const d = parseISO(`${s}T12:00:00`);
  return isValid(d) ? d : undefined;
}

function rangeFromParams(
  from: string,
  to: string
): DateRange | undefined {
  const fd = parseYmd(from);
  const td = parseYmd(to);
  if (!fd && !td) return undefined;
  return { from: fd, to: td ?? fd };
}

export type DateRangePickerProps = {
  /** `yyyy-MM-dd` */
  from: string;
  /** `yyyy-MM-dd` */
  to: string;
  onRangeChange: (from: string | null, to: string | null) => void;
  className?: string;
  id?: string;
  placeholder?: string;
};

export function DateRangePicker({
  from,
  to,
  onRangeChange,
  className,
  id,
  placeholder = "Pick a date range",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const urlRange = React.useMemo(() => rangeFromParams(from, to), [from, to]);
  const [range, setRange] = React.useState<DateRange | undefined>(() =>
    rangeFromParams(from, to)
  );

  React.useEffect(() => {
    if (!open) setRange(urlRange);
  }, [from, to, open, urlRange]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setRange(urlRange);
  };

  const handleSelect = (next: DateRange | undefined) => {
    setRange(next);
    if (!next?.from) {
      onRangeChange(null, null);
      return;
    }
    if (next.to) {
      onRangeChange(
        format(next.from, "yyyy-MM-dd"),
        format(next.to, "yyyy-MM-dd")
      );
    }
  };

  const labelRange = range ?? urlRange;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            className={cn(
              // Match SelectTrigger: h-8, flex (not inline-flex), full width; no press nudge / transform jump
              "flex h-8 min-h-8 max-h-8 w-full justify-start gap-1.5 overflow-hidden px-2.5 font-normal whitespace-nowrap",
              "border-border text-foreground active:translate-y-0 transition-none",
              !from && !to && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-left">
          {labelRange?.from ? (
            labelRange.to ? (
              <>
                {format(labelRange.from, "LLL dd, y")} –{" "}
                {format(labelRange.to, "LLL dd, y")}
              </>
            ) : (
              format(labelRange.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={labelRange?.from}
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Same as {@link DateRangePicker} — matches the shadcn “DatePickerWithRange” name. */
export { DateRangePicker as DatePickerWithRange };
