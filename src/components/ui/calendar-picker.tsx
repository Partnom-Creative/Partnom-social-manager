"use client";

import * as React from "react";
import {
  format,
  isBefore,
  isValid,
  isSameDay,
  startOfDay,
} from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CalendarPickerProps = {
  value?: string;
  /** Matches native datetime-local: `yyyy-MM-ddTHH:mm` */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  showIcon?: boolean;
  /** Minimum allowed local datetime (`yyyy-MM-ddTHH:mm`) */
  min?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
};

function parseLocalDatetime(s: string): Date | null {
  if (!s?.trim()) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const h = Number(m[4]);
  const mi = Number(m[5]);
  const dt = new Date(y, mo - 1, d, h, mi);
  return isValid(dt) ? dt : null;
}

function toDatetimeLocalValue(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

const CalendarPicker = React.forwardRef<HTMLButtonElement, CalendarPickerProps>(
  (
    {
      className,
      showIcon = true,
      value = "",
      onChange,
      min,
      disabled,
      id,
      name,
    },
    ref
  ) => {
    const timeId = React.useId();
    const selected = parseLocalDatetime(value);
    const minDate = min != null && min !== "" ? parseLocalDatetime(String(min)) : null;

    const display = selected
      ? format(selected, "PPP p")
      : "Pick date & time";

    const emitValue = (next: Date) => {
      if (!onChange) return;
      let v = next;
      if (minDate && isBefore(v, minDate)) v = minDate;
      onChange({
        target: { value: toDatetimeLocalValue(v) },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    const handleDaySelect = (day: Date | undefined) => {
      if (!day || !onChange) return;
      let hours = 9;
      let minutes = 0;
      if (selected && isSameDay(selected, day)) {
        hours = selected.getHours();
        minutes = selected.getMinutes();
      } else if (minDate && isSameDay(minDate, day)) {
        hours = minDate.getHours();
        minutes = minDate.getMinutes();
      }
      const next = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        hours,
        minutes,
        0,
        0
      );
      emitValue(next);
    };

    const handleTimeChange = (timeStr: string) => {
      if (!onChange || !selected) return;
      const [hh, mm] = timeStr.split(":").map((x) => parseInt(x, 10));
      const next = new Date(selected);
      next.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
      emitValue(next);
    };

    const timeValue = selected ? format(selected, "HH:mm") : "";
    const timeMin =
      selected && minDate && isSameDay(selected, minDate)
        ? format(minDate, "HH:mm")
        : undefined;

    return (
      <Popover>
        <PopoverTrigger
          render={
            <Button
              ref={ref}
              id={id}
              name={name}
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "h-auto min-h-9 w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                className
              )}
            />
          }
        >
          {showIcon && (
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-60" />
          )}
          <span className="truncate">{display}</span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected ?? undefined}
            onSelect={handleDaySelect}
            disabled={(date) => {
              if (!minDate) return false;
              return date < startOfDay(minDate);
            }}
            initialFocus
          />
          <div className="flex items-center gap-2 border-t p-3">
            <Label
              htmlFor={timeId}
              className="text-xs text-muted-foreground shrink-0"
            >
              Time
            </Label>
            <Input
              id={timeId}
              type="time"
              className="flex-1"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              disabled={disabled || !selected}
              min={timeMin}
            />
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
CalendarPicker.displayName = "CalendarPicker";

export { CalendarPicker };
