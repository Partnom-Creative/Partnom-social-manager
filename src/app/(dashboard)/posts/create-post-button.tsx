"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Send, Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type ClientWithAccounts = {
  id: string;
  name: string;
  color: string | null;
  socialAccounts: { id: string; platform: string; accountName: string; accountHandle: string | null }[];
};

const PLATFORM_LIMITS: Record<string, number> = {
  TWITTER: 280,
  LINKEDIN: 3000,
  YOUTUBE: 5000,
  INSTAGRAM: 2200,
};

export function CreatePostButton({ clients }: { clients: ClientWithAccounts[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [clientId, setClientId] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [publishNow, setPublishNow] = useState(false);

  const selectedClient = clients.find((c) => c.id === clientId);
  const accounts = selectedClient?.socialAccounts || [];

  function toggleAccount(accountId: string) {
    setSelectedAccounts((prev) =>
      prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
    );
  }

  const selectedPlatforms = accounts
    .filter((a) => selectedAccounts.includes(a.id))
    .map((a) => a.platform);

  const lowestLimit = selectedPlatforms.length > 0
    ? Math.min(...selectedPlatforms.map((p) => PLATFORM_LIMITS[p] || 5000))
    : 5000;

  const isOverLimit = content.length > lowestLimit;

  async function onSubmit() {
    if (!content.trim() || !clientId || selectedAccounts.length === 0) return;
    setLoading(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: content.trim(),
        clientId,
        accountIds: selectedAccounts,
        scheduledAt: scheduledAt || null,
        publishNow,
      }),
    });

    if (res.ok) {
      toast.success(publishNow ? "Post queued for publishing" : scheduledAt ? "Post scheduled" : "Draft saved");
      setOpen(false);
      resetForm();
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to create post");
    }
    setLoading(false);
  }

  function resetForm() {
    setContent("");
    setClientId("");
    setSelectedAccounts([]);
    setScheduledAt("");
    setPublishNow(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" />
        New Post
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>Compose a post and publish to selected platforms.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={clientId} onValueChange={(v) => { setClientId(v ?? ""); setSelectedAccounts([]); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color || "#6366f1" }} />
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {clientId && (
            <div className="space-y-2">
              <Label>Publish To</Label>
              {accounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No social accounts connected for this client.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {accounts.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAccount(a.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors ${
                        selectedAccounts.includes(a.id)
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        {a.platform.toLowerCase()}
                      </Badge>
                      {a.accountName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Content</Label>
              <span className={`text-xs ${isOverLimit ? "text-destructive" : "text-muted-foreground"}`}>
                {content.length} / {lowestLimit}
              </span>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to share?"
              rows={5}
            />
          </div>

          <div className="space-y-3 border rounded-lg p-4">
            <Label className="text-sm font-medium">Scheduling</Label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={publishNow}
                  onCheckedChange={(v) => {
                    setPublishNow(!!v);
                    if (v) setScheduledAt("");
                  }}
                />
                <span className="text-sm">Publish Now</span>
              </label>
            </div>
            {!publishNow && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Schedule for later</Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={onSubmit}
            disabled={loading || !content.trim() || !clientId || selectedAccounts.length === 0 || isOverLimit}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : publishNow ? (
              <Send className="mr-2 h-4 w-4" />
            ) : scheduledAt ? (
              <Clock className="mr-2 h-4 w-4" />
            ) : null}
            {publishNow ? "Publish Now" : scheduledAt ? "Schedule" : "Save Draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
