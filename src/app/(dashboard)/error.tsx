"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = error.message?.trim();

  return (
    <div className="flex min-h-[min(60vh,32rem)] flex-col items-center justify-center">
      <Card className="w-full max-w-md border-slate-200 shadow-md">
        <CardHeader className="items-center space-y-4 pb-2 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 ring-1 ring-amber-100"
            aria-hidden
          >
            <AlertTriangle className="h-7 w-7 text-amber-600" />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-xl text-slate-900">
              Something went wrong
            </CardTitle>
            {message ? (
              <CardDescription
                className={cn(
                  "text-left text-sm text-slate-600",
                  "rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
                )}
              >
                {message}
              </CardDescription>
            ) : (
              <CardDescription className="text-slate-500">
                An unexpected error occurred. You can try again or return to the
                dashboard.
              </CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <Button
            type="button"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={() => reset()}
          >
            Try again
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full border-slate-300"
            )}
          >
            Go to dashboard
          </Link>
        </CardContent>
        {error.digest ? (
          <CardFooter className="justify-center border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
            Error ID: {error.digest}
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
