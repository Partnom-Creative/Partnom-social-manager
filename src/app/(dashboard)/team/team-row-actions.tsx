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
import { Loader2, Mail, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { InviteStatus } from "@/generated/prisma/client";
import {
  MemberEditDrawer,
  type AccessEntry,
  type ClientOption,
} from "./member-edit-drawer";

type TeamRowActionsProps =
  | { variant: "invite"; inviteId: string; status: InviteStatus }
  | {
      variant: "member";
      memberId: string;
      memberName: string;
      memberEmail: string;
      memberInitials: string;
      currentRole: "ADMIN" | "EDITOR" | "MEMBER";
      isSelf: boolean;
      showClientAccess: boolean;
      allClients: ClientOption[];
      currentAccess: AccessEntry[];
    };

export function TeamRowActions(props: TeamRowActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  if (props.variant === "invite") {
    const { inviteId, status } = props;
    const canResend = status !== "ACCEPTED";

    async function onResend() {
      setBusy("resend");
      try {
        const res = await fetch(`/api/team/invites/${inviteId}`, { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          toast.success("Invitation email sent");
          router.refresh();
        } else {
          toast.error(typeof data.error === "string" ? data.error : "Failed to resend");
        }
      } finally {
        setBusy(null);
      }
    }

    async function onRemove() {
      if (!confirm("Remove this invitation?")) return;
      setBusy("delete");
      try {
        const res = await fetch(`/api/team/invites/${inviteId}`, { method: "DELETE" });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          toast.success("Invitation removed");
          router.refresh();
        } else {
          toast.error(typeof data.error === "string" ? data.error : "Failed to remove");
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
              aria-label="Invitation actions"
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
            onClick={() => void onRemove()}
            disabled={busy !== null}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const {
    memberId,
    memberName,
    memberEmail,
    memberInitials,
    currentRole,
    isSelf,
    showClientAccess,
    allClients,
    currentAccess,
  } = props;

  const [editOpen, setEditOpen] = useState(false);

  async function onDelete() {
    if (!confirm("Remove this team member? They will lose access to your organization.")) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/team/${memberId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Member removed");
        router.refresh();
      } else {
        toast.error(typeof data.error === "string" ? data.error : "Failed to remove");
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              disabled={busy !== null}
              aria-label="Member actions"
            />
          }
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              // Base UI Menu.Item uses onClick, not Radix’s onSelect
              setEditOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit role
          </DropdownMenuItem>
          {!isSelf && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => void onDelete()}
                disabled={busy !== null}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <MemberEditDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        memberId={memberId}
        memberName={memberName}
        memberEmail={memberEmail}
        memberInitials={memberInitials}
        currentRole={currentRole}
        isSelf={isSelf}
        showClientAccess={showClientAccess}
        allClients={allClients}
        currentAccess={currentAccess}
      />
    </>
  );
}
