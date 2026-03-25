import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="hidden h-9 w-32 shrink-0 rounded-md sm:block" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-slate-200/80">
            <CardContent className="flex items-center gap-3 p-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-10" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/80 overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b border-slate-100 p-4">
            <Skeleton className="h-9 w-full max-w-sm rounded-md" />
          </div>

          <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_48px] gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <span className="sr-only">Actions</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_48px] items-center gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-40 max-w-full" />
                    <Skeleton className="h-3 w-48 max-w-full" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-8 justify-self-end rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
