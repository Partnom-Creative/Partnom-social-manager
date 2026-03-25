"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Mail, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { InviteStatus } from "@/generated/prisma/client";

export function InviteRowActions({
  inviteId,
  status,
}: {
  inviteId: string;
  status: InviteStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"resend" | "delete" | null>(null);

  const canResend = status !== "ACCEPTED";

  async function onResend() {
    setBusy("resend");
    try {
      const res = await fetch(`/api/invites/${inviteId}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Invite email sent");
        router.refresh();
      } else {
        toast.error(typeof data.error === "string" ? data.error : "Failed to resend invite");
      }
    } finally {
      setBusy(null);
    }
  }

  async function onDelete() {
    if (!confirm("Remove this invite? This cannot be undone.")) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/invites/${inviteId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Invite removed");
        router.refresh();
      } else {
        toast.error(typeof data.error === "string" ? data.error : "Failed to remove invite");
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            disabled={busy !== null}
            aria-label="Invite actions"
          />
        }
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canResend && (
          <DropdownMenuItem onClick={() => void onResend()} disabled={busy !== null}>
            <Mail className="h-3.5 w-3.5" />
            Resend
          </DropdownMenuItem>
        )}
        {canResend && <DropdownMenuSeparator />}
        <DropdownMenuItem
          variant="destructive"
          onClick={() => void onDelete()}
          disabled={busy !== null}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
