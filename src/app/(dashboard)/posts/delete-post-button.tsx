"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this post?")) return;
    setLoading(true);

    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Post deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete post");
    }
    setLoading(false);
  }

  return (
    <Button variant="ghost" size="icon" onClick={onDelete} disabled={loading} className="shrink-0 text-muted-foreground hover:text-destructive">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
