import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200/90 dark:bg-slate-700/50",
        className
      )}
    />
  );
}

export default function ClientsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <SkeletonBar className="h-8 w-32" />
          <SkeletonBar className="h-4 w-72 max-w-full" />
        </div>
        <SkeletonBar className="hidden h-9 w-28 shrink-0 rounded-md sm:block" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-slate-200/80">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <SkeletonBar className="h-10 w-10 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <SkeletonBar className="h-4 w-3/4 max-w-[160px]" />
                    <SkeletonBar className="h-3 w-20" />
                  </div>
                </div>
                <SkeletonBar className="h-5 w-14 shrink-0 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <SkeletonBar className="h-4 w-24" />
                <SkeletonBar className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
