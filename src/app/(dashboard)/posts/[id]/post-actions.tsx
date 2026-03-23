"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  Pencil,
  Trash2,
  Send,
  Clock,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function PostActions({
  postId,
  status,
}: {
  postId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  const isLoading = loading !== null;

  async function handleAction(action: string) {
    setLoading(action);
    try {
      if (action === "delete") {
        if (!confirm("Are you sure you want to delete this post?")) {
          setLoading(null);
          return;
        }
        const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
        if (res.ok) {
          toast.success("Post deleted");
          router.push("/posts");
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to delete");
        }
        setLoading(null);
        return;
      }

      const bodyMap: Record<string, Record<string, unknown>> = {
        publish: { scheduledAt: new Date().toISOString() },
        cancel: { scheduledAt: null },
        retry: { scheduledAt: new Date().toISOString() },
        schedule: { scheduledAt },
      };

      if (action === "schedule" && !scheduledAt) {
        setLoading(null);
        return;
      }

      const res = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyMap[action]),
      });

      if (action === "schedule") setScheduleDialogOpen(false);

      if (res.ok) {
        const msgs: Record<string, string> = {
          publish: "Post queued for publishing",
          cancel: "Post reverted to draft",
          retry: "Retry scheduled",
          schedule: "Post scheduled",
        };
        toast.success(msgs[action] || "Success");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Action failed");
      }
    } catch {
      toast.error("An error occurred");
    }
    setLoading(null);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {status === "DRAFT" && (
          <>
            <Link href={`/posts/${postId}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => handleAction("publish")}
              disabled={isLoading}
            >
              {loading === "publish" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Publish Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScheduleDialogOpen(true)}
              disabled={isLoading}
            >
              <Clock className="h-4 w-4" />
              Schedule
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction("delete")}
              disabled={isLoading}
            >
              {loading === "delete" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </>
        )}

        {status === "SCHEDULED" && (
          <>
            <Link href={`/posts/${postId}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction("cancel")}
              disabled={isLoading}
            >
              {loading === "cancel" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Cancel Schedule
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction("delete")}
              disabled={isLoading}
            >
              {loading === "delete" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </>
        )}

        {status === "FAILED" && (
          <>
            <Link href={`/posts/${postId}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => handleAction("retry")}
              disabled={isLoading}
            >
              {loading === "retry" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Retry
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction("delete")}
              disabled={isLoading}
            >
              {loading === "delete" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </>
        )}
      </div>

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Post</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <CalendarPicker
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScheduleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction("schedule")}
              disabled={!scheduledAt || isLoading}
            >
              {loading === "schedule" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
