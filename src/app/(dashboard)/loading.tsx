import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Welcome */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border-slate-200/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card className="border-slate-200/80">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-0">
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Skeleton className="mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-3 w-48 max-w-full" />
                </div>
                <Skeleton className="h-3 w-14 shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
