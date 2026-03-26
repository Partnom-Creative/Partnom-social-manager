"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  formatAccessLevelLabel,
  formatRoleLabel,
  ORG_ROLE_DESCRIPTIONS,
} from "@/lib/format-role";

export type ClientOption = {
  id: string;
  name: string;
  color: string | null;
};

export type AccessEntry = {
  clientId: string;
  clientName: string;
  clientColor: string;
  accessLevel: string;
};

type MemberEditDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberInitials: string;
  currentRole: "ADMIN" | "EDITOR" | "MEMBER";
  isSelf: boolean;
  /** When false (org admin), client rows are hidden — admins have full org access */
  showClientAccess: boolean;
  allClients: ClientOption[];
  currentAccess: AccessEntry[];
};

export function MemberEditDrawer({
  open,
  onOpenChange,
  memberId,
  memberName,
  memberEmail,
  memberInitials,
  currentRole,
  isSelf,
  showClientAccess,
  allClients,
  currentAccess,
}: MemberEditDrawerProps) {
  const router = useRouter();
  const [roleBusy, setRoleBusy] = useState(false);
  const [clientLoading, setClientLoading] = useState<string | null>(null);

  const accessMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of currentAccess) m.set(a.clientId, a.accessLevel);
    return m;
  }, [currentAccess]);

  const [localAccess, setLocalAccess] = useState<Map<string, string | "NONE">>(() => new Map());

  useEffect(() => {
    const m = new Map<string, string | "NONE">();
    for (const c of allClients) {
      const level = accessMap.get(c.id);
      m.set(c.id, level ?? "NONE");
    }
    setLocalAccess(m);
  }, [allClients, accessMap, open]);

  async function setRole(role: "ADMIN" | "EDITOR" | "MEMBER") {
    if (isSelf) return;
    setRoleBusy(true);
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Role updated");
        router.refresh();
      } else {
        toast.error(typeof data.error === "string" ? data.error : "Failed to update role");
      }
    } finally {
      setRoleBusy(false);
    }
  }

  async function applyClientAccess(clientId: string, next: "NONE" | "VIEW" | "CREATE" | "MANAGE") {
    setClientLoading(clientId);
    try {
      if (next === "NONE") {
        const res = await fetch(`/api/team/${memberId}/access?clientId=${encodeURIComponent(clientId)}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          toast.error("Failed to remove access");
          throw new Error("remove failed");
        }
        toast.success("Access updated");
      } else {
        const res = await fetch(`/api/team/${memberId}/access`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId, accessLevel: next }),
        });
        if (!res.ok) {
          toast.error("Failed to update access");
          throw new Error("put failed");
        }
        toast.success("Access updated");
      }
      router.refresh();
    } finally {
      setClientLoading(null);
    }
  }

  function onClientLevelChange(clientId: string, value: string) {
    const prev = localAccess.get(clientId) ?? "NONE";
    setLocalAccess((m) => {
      const next = new Map(m);
      next.set(clientId, value as "NONE" | "VIEW" | "CREATE" | "MANAGE");
      return next;
    });
    void applyClientAccess(clientId, value as "NONE" | "VIEW" | "CREATE" | "MANAGE").catch(() => {
      setLocalAccess((m) => {
        const next = new Map(m);
        next.set(clientId, prev);
        return next;
      });
    });
  }

  const roleDescription =
    currentRole === "ADMIN"
      ? ORG_ROLE_DESCRIPTIONS.ADMIN
      : currentRole === "EDITOR"
        ? ORG_ROLE_DESCRIPTIONS.EDITOR
        : ORG_ROLE_DESCRIPTIONS.MEMBER;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right" modal>
      <DrawerContent className="ml-auto flex h-full max-h-svh w-full max-w-md flex-col rounded-none border-l p-0 sm:max-w-md">
        <DrawerHeader className="shrink-0 border-b">
          <DrawerTitle>Team member</DrawerTitle>
          <DrawerDescription>
            Organization role and which clients this person can access.
          </DrawerDescription>
        </DrawerHeader>

        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-14 w-14 shrink-0 rounded-xl border-0 shadow-none ring-0 [&]:after:hidden">
              <AvatarFallback className="rounded-xl text-base font-medium">{memberInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-base font-semibold leading-tight">{memberName}</p>
              <p className="truncate text-sm text-muted-foreground">{memberEmail}</p>
              <Badge variant="secondary" className="text-xs font-normal normal-case">
                {formatRoleLabel(currentRole)}
              </Badge>
            </div>
          </div>

          {!isSelf && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Organization role</p>
              <Select
                value={currentRole}
                disabled={roleBusy}
                onValueChange={(v) => {
                  if (v === "ADMIN" || v === "EDITOR" || v === "MEMBER") void setRole(v);
                }}
              >
                <SelectTrigger className="w-full max-w-md normal-case">
                  <SelectValue placeholder="Role">
                    {(value: string | null) => (value ? formatRoleLabel(value) : "Role")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="normal-case">Role</SelectLabel>
                    <SelectItem value="ADMIN" className="normal-case">
                      Admin
                    </SelectItem>
                    <SelectItem value="EDITOR" className="normal-case">
                      Manager
                    </SelectItem>
                    <SelectItem value="MEMBER" className="normal-case">
                      Editor
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-xs leading-relaxed text-muted-foreground normal-case">{roleDescription}</p>
              <p className="text-xs leading-relaxed text-muted-foreground normal-case">
                Only org admins can invite new team members. Managers and editors are assigned to clients
                below.
              </p>
              {roleBusy && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Updating…
                </p>
              )}
            </div>
          )}

          {isSelf && (
            <p className="text-sm text-muted-foreground normal-case">
              You can’t change your own role here. Ask another admin if needed.
            </p>
          )}

          {showClientAccess && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Client access</p>
              {allClients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clients in this organization yet.</p>
              ) : (
                <ul className="space-y-3">
                  {allClients.map((client) => {
                    const color = client.color || "#6366f1";
                    const value = localAccess.get(client.id) ?? "NONE";
                    const busy = clientLoading === client.id;
                    return (
                      <li
                        key={client.id}
                        className="flex items-center gap-3 rounded-lg border border-border/80 bg-card/30 px-3 py-2.5"
                      >
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate text-sm font-medium normal-case">
                          {client.name}
                        </span>
                        <Select
                          value={value}
                          disabled={busy}
                          onValueChange={(v) => {
                            if (v) onClientLevelChange(client.id, v);
                          }}
                        >
                          <SelectTrigger className="h-9 w-[140px] shrink-0 text-xs normal-case">
                            <SelectValue placeholder="Access">
                              {(val: string | null) =>
                                val && val !== "NONE" ? formatAccessLevelLabel(val) : "No access"
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent align="end">
                            <SelectGroup>
                              <SelectLabel className="normal-case">Access</SelectLabel>
                              <SelectItem value="NONE" className="normal-case">
                                No access
                              </SelectItem>
                              <SelectItem value="VIEW" className="normal-case">
                                View
                              </SelectItem>
                              <SelectItem value="CREATE" className="normal-case">
                                Create
                              </SelectItem>
                              <SelectItem value="MANAGE" className="normal-case">
                                Manage
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {busy && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {!showClientAccess && currentRole === "ADMIN" && (
            <p className="text-sm text-muted-foreground normal-case">
              {ORG_ROLE_DESCRIPTIONS.ADMIN} Per-client rules do not apply.
            </p>
          )}
        </div>

        <DrawerFooter className="shrink-0 border-t bg-background">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
