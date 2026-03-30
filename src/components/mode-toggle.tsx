"use client";

import * as React from "react";
import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemePreviewDark, ThemePreviewLight, ThemePreviewSystem } from "@/components/theme-preview-svgs";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "dark" as const, label: "Dark", Preview: ThemePreviewDark },
  { value: "light" as const, label: "Light", Preview: ThemePreviewLight },
  { value: "system" as const, label: "System", Preview: ThemePreviewSystem },
];

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="outline" size="icon" className="relative" aria-hidden disabled />;
  }

  const active = theme ?? "system";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative shrink-0"
            aria-label="Choose theme"
          />
        }
      >
        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-fit max-w-[min(100vw-1rem,20rem)] gap-0 p-2"
      >
        <div role="radiogroup" aria-label="Theme" className="flex w-fit flex-col gap-1">
          {OPTIONS.map(({ value, label, Preview }) => {
            const selected = active === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-fit max-w-full flex-row items-center gap-3 rounded-lg py-1.5 pl-1 pr-2 text-left outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <span
                  className={cn(
                    "shrink-0 rounded-[10px] p-0.5 transition-shadow",
                    selected ? "ring-2 ring-primary shadow-sm" : "ring-2 ring-transparent"
                  )}
                >
                  <Preview className="pointer-events-none h-[52px] w-20" />
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/45 bg-transparent"
                    )}
                    aria-hidden
                  >
                    {selected && <Check className="h-2.5 w-2.5" strokeWidth={2.5} />}
                  </span>
                  <span className="whitespace-nowrap text-sm leading-tight text-foreground">{label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
