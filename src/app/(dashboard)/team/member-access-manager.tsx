"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

type AccessEntry = {
  clientId: string;
  clientName: string;
  clientColor: string;
  accessLevel: string;
};

type ClientOption = {
  id: string;
  name: string;
  color: string | null;
};

export function MemberAccessManager({
  memberId,
  memberName,
  currentAccess,
  allClients,
}: {
  memberId: string;
  memberName: string;
  currentAccess: AccessEntry[];
  allClients: ClientOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [addingClient, setAddingClient] = useState<string>("");

  const assignedClientIds = new Set(currentAccess.map((a) => a.clientId));
  const unassignedClients = allClients.filter((c) => !assignedClientIds.has(c.id));

  async function updateAccess(clientId: string, accessLevel: string) {
    setLoading(clientId);
    const res = await fetch(`/api/team/${memberId}/access`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, accessLevel }),
    });
    if (res.ok) {
      toast.success("Access updated");
      router.refresh();
    } else {
      toast.error("Failed to update access");
    }
    setLoading(null);
  }

  async function removeAccess(clientId: string) {
    setLoading(clientId);
    const res = await fetch(`/api/team/${memberId}/access?clientId=${clientId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Access removed");
      router.refresh();
    } else {
      toast.error("Failed to remove access");
    }
    setLoading(null);
  }

  async function addAccess() {
    if (!addingClient) return;
    await updateAccess(addingClient, "VIEW");
    setAddingClient("");
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground tracking-wider">Client Access</p>

      {currentAccess.length === 0 && (
        <p className="text-sm text-muted-foreground">No client access assigned</p>
      )}

      <div className="flex flex-wrap gap-2">
        {currentAccess.map((entry) => (
          <div key={entry.clientId} className="flex items-center gap-1.5 border rounded-md px-2 py-1">
            <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.clientColor }} />
            <span className="text-sm">{entry.clientName}</span>
            <Select
              defaultValue={entry.accessLevel}
              onValueChange={(v) => v && updateAccess(entry.clientId, v)}
            >
              <SelectTrigger className="h-6 w-24 text-xs border-0 bg-transparent px-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Access</SelectLabel>
                  <SelectItem value="VIEW">View</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="MANAGE">Manage</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <button
              onClick={() => removeAccess(entry.clientId)}
              className="text-muted-foreground hover:text-destructive transition-colors"
              disabled={loading === entry.clientId}
            >
              {loading === entry.clientId ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
            </button>
          </div>
        ))}
      </div>

      {unassignedClients.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <Select value={addingClient} onValueChange={(v) => setAddingClient(v ?? "")}>
            <SelectTrigger className="h-8 w-48 text-xs">
              <SelectValue placeholder="Add client access..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Clients</SelectLabel>
                {unassignedClients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={addAccess} disabled={!addingClient}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
