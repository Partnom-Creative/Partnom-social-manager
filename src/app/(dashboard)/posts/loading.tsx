import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28 shrink-0 rounded-md" />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      <Card className="border-slate-200/80 overflow-hidden">
        <CardContent className="p-0">
          {/* Table header */}
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.7fr)] gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
          </div>
          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.7fr)] items-center gap-3 px-4 py-3"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full max-w-[280px]" />
                  <Skeleton className="h-3 w-3/4 max-w-[200px]" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-6 w-20 rounded-md" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
