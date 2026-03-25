import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { getAccessibleClientIds } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  User,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { PostActions } from "./post-actions";
import { cn } from "@/lib/utils";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  SCHEDULED: "bg-amber-50 text-amber-700 border-amber-200",
  PUBLISHING: "bg-blue-50 text-blue-700 border-blue-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

const PLATFORM_BADGE_CLASSES: Record<string, string> = {
  TWITTER: "bg-slate-900 text-white border-slate-900",
  LINKEDIN: "bg-blue-600 text-white border-blue-600",
  YOUTUBE: "bg-red-600 text-white border-red-600",
  INSTAGRAM: "bg-pink-600 text-white border-pink-600",
  SUBSTACK: "bg-orange-600 text-white border-orange-600",
};

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;
  const accessibleIds = await getAccessibleClientIds(user.id, user.organizationId, user.role);

  const post = await db.post.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, color: true, slug: true } },
      author: { select: { id: true, name: true, email: true } },
      targets: {
        include: {
          socialAccount: {
            select: {
              id: true,
              platform: true,
              accountName: true,
              accountHandle: true,
            },
          },
        },
      },
    },
  });

  if (!post) notFound();

  if (!accessibleIds.includes(post.clientId)) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/posts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: post.client.color || "#6366f1" }}
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {post.client.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={post.status} />
              <span className="text-sm text-slate-500">
                Created {format(new Date(post.createdAt), "MMM d, yyyy h:mm a")}
              </span>
            </div>
          </div>
        </div>
        <PostActions postId={post.id} status={post.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </CardContent>
      </Card>

      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {post.mediaUrls.map((url, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <ImageIcon className="h-4 w-4 shrink-0 text-slate-400" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline truncate"
                  >
                    {url}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Target Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          {post.targets.length === 0 ? (
            <p className="text-sm text-slate-500">No target platforms.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {post.targets.map((target) => (
                <div
                  key={target.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          PLATFORM_BADGE_CLASSES[
                            target.socialAccount.platform
                          ]
                        )}
                      >
                        {target.socialAccount.platform.toLowerCase()}
                      </Badge>
                      <span className="text-sm font-medium">
                        {target.socialAccount.accountName}
                      </span>
                    </div>
                    <StatusBadge status={target.status} className="text-xs" />
                  </div>

                  {target.socialAccount.accountHandle && (
                    <p className="text-xs text-slate-500">
                      @{target.socialAccount.accountHandle}
                    </p>
                  )}

                  {target.status === "PUBLISHED" && target.platformPostId && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600">
                      <ExternalLink className="h-3 w-3" />
                      <span className="truncate">
                        {target.platformPostId}
                      </span>
                    </div>
                  )}

                  {target.status === "PUBLISHED" && target.publishedAt && (
                    <p className="text-xs text-slate-400 mt-1">
                      Published{" "}
                      {format(
                        new Date(target.publishedAt),
                        "MMM d, yyyy h:mm a"
                      )}
                    </p>
                  )}

                  {target.status === "FAILED" && target.errorMsg && (
                    <p className="text-xs text-red-600 mt-2 bg-red-50 rounded px-2 py-1">
                      {target.errorMsg}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Author
              </dt>
              <dd className="font-medium mt-0.5">
                {post.author.name || post.author.email}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Created
              </dt>
              <dd className="font-medium mt-0.5">
                {format(new Date(post.createdAt), "MMM d, yyyy h:mm a")}
              </dd>
            </div>
            {post.scheduledAt && (
              <div>
                <dt className="text-slate-500 flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Scheduled
                </dt>
                <dd className="font-medium mt-0.5">
                  {format(
                    new Date(post.scheduledAt),
                    "MMM d, yyyy h:mm a"
                  )}
                </dd>
              </div>
            )}
            {post.publishedAt && (
              <div>
                <dt className="text-slate-500 flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Published
                </dt>
                <dd className="font-medium mt-0.5">
                  {format(
                    new Date(post.publishedAt),
                    "MMM d, yyyy h:mm a"
                  )}
                </dd>
              </div>
            )}
          </dl>
          {post.errorMsg && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{post.errorMsg}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
