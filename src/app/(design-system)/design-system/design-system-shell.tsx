"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

/**
 * Chrome for the design workspace only — not used by the product dashboard.
 * Keeps tokens/components preview visually and structurally separate from app UI.
 */
export function DesignSystemShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-route="design-studio"
      className="flex min-h-dvh flex-col bg-gradient-to-b from-amber-50/35 via-background to-muted/25 dark:from-amber-950/20 dark:via-background dark:to-muted/15"
    >
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:border-border hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">Back to app</span>
              <span className="sm:hidden">App</span>
            </Link>
            <div className="h-8 w-px shrink-0 bg-border" aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                Design workspace
              </p>
              <h1 className="truncate text-base font-semibold tracking-tight text-foreground">
                Tokens & components
              </h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Theme
            </span>
            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>

      <footer className="border-t border-border/80 bg-muted/25 py-5 text-center text-xs text-muted-foreground">
        Isolated from the signed-in dashboard — open{" "}
        <Link href="/" className="font-medium text-foreground underline-offset-2 hover:underline">
          Social Hub
        </Link>{" "}
        when you want the product. Short URL:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">/studio</code>
        .
      </footer>
    </div>
  );
}
