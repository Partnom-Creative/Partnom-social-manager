import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start px-3 py-2.5 [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default:
          "border-border bg-card px-4 py-3 text-card-foreground [&>svg]:text-foreground/80 [&_[data-slot=alert-description]]:text-muted-foreground",
        destructive:
          "border-destructive/50 px-4 py-3 text-destructive dark:border-destructive [&>svg]:text-current [&_[data-slot=alert-description]]:text-destructive/90",
        info: "border-[#434F70]/25 bg-[#CAD3EC] text-[#434F70] [&>svg]:text-[#434F70] [&_[data-slot=alert-description]]:text-[#434F70]",
        warning:
          "border-[#594624]/20 bg-[#ECE0CA] text-[#594624] [&>svg]:text-[#594624] [&_[data-slot=alert-description]]:text-[#594624]",
        success:
          "border-[#1A5823]/20 bg-[#CAECCF] text-[#1A5823] [&>svg]:text-[#1A5823] [&_[data-slot=alert-description]]:text-[#1A5823]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1.5 text-sm [&_p]:leading-snug",
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
