import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CalendarPickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  showIcon?: boolean;
}

const CalendarPicker = React.forwardRef<HTMLInputElement, CalendarPickerProps>(
  ({ className, showIcon = true, ...props }, ref) => {
    return (
      <div className="relative">
        {showIcon && (
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <input
          type="datetime-local"
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
            showIcon && "pl-9",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
CalendarPicker.displayName = "CalendarPicker";

export { CalendarPicker };
