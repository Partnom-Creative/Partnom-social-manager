"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 px-4">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/80 via-slate-50 to-slate-50"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-slate-300/25 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <p className="text-7xl font-bold tracking-tight text-indigo-600/90 sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Head back to your dashboard to continue.
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Link
            href="/"
            className={cn(
              buttonVariants({ size: "lg" }),
              "inline-flex gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
            )}
          >
            <Home className="h-4 w-4" />
            Go to dashboard
          </Link>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="border-slate-300"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
