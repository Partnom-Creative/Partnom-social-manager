"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Send,
  Clock,
  Save,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  ThumbsUp,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const PLATFORM_LIMITS: Record<string, number> = {
  TWITTER: 280,
  LINKEDIN: 3000,
  YOUTUBE: 5000,
  INSTAGRAM: 2200,
};

const PLATFORM_LABELS: Record<string, string> = {
  TWITTER: "X (Twitter)",
  LINKEDIN: "LinkedIn",
  YOUTUBE: "YouTube",
  INSTAGRAM: "Instagram",
  SUBSTACK: "Substack",
};

const PLATFORM_BADGE_CLASSES: Record<string, string> = {
  TWITTER: "bg-slate-900 text-white border-slate-900",
  LINKEDIN: "bg-blue-600 text-white border-blue-600",
  YOUTUBE: "bg-red-600 text-white border-red-600",
  INSTAGRAM: "bg-pink-600 text-white border-pink-600",
  SUBSTACK: "bg-orange-600 text-white border-orange-600",
};

type SocialAccount = {
  id: string;
  platform: string;
  accountName: string;
  accountHandle: string | null;
};

type ClientWithAccounts = {
  id: string;
  name: string;
  color: string | null;
  socialAccounts: SocialAccount[];
};

type InitialData = {
  id: string;
  content: string;
  mediaUrls: string[];
  status: string;
  scheduledAt: string | null;
  clientId: string;
  targets: { socialAccountId: string; socialAccount: SocialAccount }[];
};

export function PostComposer({
  clients,
  defaultClientId,
  initialData,
}: {
  clients: ClientWithAccounts[];
  defaultClientId?: string;
  initialData?: InitialData;
}) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [clientId, setClientId] = useState(
    initialData?.clientId || defaultClientId || ""
  );
  const [content, setContent] = useState(initialData?.content || "");
  const [mediaUrlsInput, setMediaUrlsInput] = useState(
    initialData?.mediaUrls?.join(", ") || ""
  );
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(
    initialData?.targets?.map((t) => t.socialAccountId) || []
  );
  const [scheduledAt, setScheduledAt] = useState(
    initialData?.scheduledAt
      ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
      : ""
  );
  const [scheduleMode, setScheduleMode] = useState<
    "draft" | "schedule" | "now"
  >(
    initialData?.status === "SCHEDULED" && initialData?.scheduledAt
      ? "schedule"
      : "draft"
  );
  const [loading, setLoading] = useState(false);

  const selectedClient = clients.find((c) => c.id === clientId);
  const accounts = selectedClient?.socialAccounts || [];

  function handleClientChange(newClientId: string) {
    setClientId(newClientId);
    setSelectedAccounts([]);
  }

  function toggleAccount(accountId: string) {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  }

  const selectedPlatforms = useMemo(() => {
    return accounts
      .filter((a) => selectedAccounts.includes(a.id))
      .map((a) => a.platform);
  }, [accounts, selectedAccounts]);

  const uniquePlatforms = useMemo(
    () => [...new Set(selectedPlatforms)],
    [selectedPlatforms]
  );

  const charLimit = useMemo(() => {
    if (uniquePlatforms.length === 0) return null;
    const limits = uniquePlatforms
      .map((p) => PLATFORM_LIMITS[p])
      .filter(Boolean);
    return limits.length > 0 ? Math.min(...limits) : null;
  }, [uniquePlatforms]);

  const platformWarnings = useMemo(() => {
    const warnings: { platform: string; limit: number }[] = [];
    for (const p of uniquePlatforms) {
      const limit = PLATFORM_LIMITS[p];
      if (limit && content.length > limit) {
        warnings.push({ platform: p, limit });
      }
    }
    return warnings;
  }, [uniquePlatforms, content]);

  const mediaUrls = useMemo(() => {
    return mediaUrlsInput
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
  }, [mediaUrlsInput]);

  async function handleSubmit(mode: "draft" | "schedule" | "now") {
    if (!content.trim() || !clientId || selectedAccounts.length === 0) return;
    setLoading(true);

    const body: Record<string, unknown> = {
      content: content.trim(),
      clientId,
      accountIds: selectedAccounts,
      mediaUrls,
    };

    if (mode === "now") {
      body.publishNow = true;
    } else if (mode === "schedule" && scheduledAt) {
      body.scheduledAt = scheduledAt;
    }

    const url = isEditing ? `/api/posts/${initialData!.id}` : "/api/posts";
    const method = isEditing ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const msg =
          mode === "now"
            ? "Post queued for publishing"
            : mode === "schedule"
              ? "Post scheduled"
              : "Draft saved";
        toast.success(msg);
        router.push(
          isEditing ? `/posts/${initialData!.id}` : data.id ? `/posts/${data.id}` : "/posts"
        );
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save post");
      }
    } catch {
      toast.error("An error occurred");
    }
    setLoading(false);
  }

  const isValid =
    content.trim().length > 0 && clientId && selectedAccounts.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-2">
          <Label>Client</Label>
          <Select
            value={clientId || undefined}
            onValueChange={(v) => v && handleClientChange(v)}
            disabled={isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: c.color || "#6366f1" }}
                    />
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
              <p className="text-sm text-slate-500">
                No social accounts connected for this client.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {accounts.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAccount(a.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition-colors",
                      selectedAccounts.includes(a.id)
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 hover:border-slate-400"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block rounded px-1.5 py-0 text-[10px] font-semibold",
                        PLATFORM_BADGE_CLASSES[a.platform] ||
                          "bg-slate-200 text-slate-700"
                      )}
                    >
                      {a.platform.toLowerCase()}
                    </span>
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
            <span
              className={cn(
                "text-xs",
                charLimit && content.length > charLimit
                  ? "text-red-600 font-medium"
                  : "text-slate-500"
              )}
            >
              {content.length}
              {charLimit ? ` / ${charLimit}` : ""}
            </span>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What would you like to share?"
            rows={6}
          />
          {platformWarnings.length > 0 && (
            <div className="space-y-1">
              {platformWarnings.map((w) => (
                <div
                  key={w.platform}
                  className="flex items-center gap-1.5 text-xs text-amber-600"
                >
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  Exceeds {PLATFORM_LABELS[w.platform]} limit ({w.limit} chars)
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Media URLs</Label>
          <Input
            value={mediaUrlsInput}
            onChange={(e) => setMediaUrlsInput(e.target.value)}
            placeholder="Paste URLs separated by commas"
          />
          {mediaUrls.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {mediaUrls.map((url, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-xs max-w-[200px] truncate"
                >
                  <ImageIcon className="h-3 w-3 mr-1 shrink-0" />
                  {url}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            <Label className="text-sm font-medium mb-3 block">
              Publishing
            </Label>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="schedule"
                    checked={scheduleMode === "draft"}
                    onChange={() => setScheduleMode("draft")}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <span className="text-sm">Save as draft</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="schedule"
                    checked={scheduleMode === "schedule"}
                    onChange={() => setScheduleMode("schedule")}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <span className="text-sm">Schedule</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="schedule"
                    checked={scheduleMode === "now"}
                    onChange={() => setScheduleMode("now")}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <span className="text-sm">Publish now</span>
                </label>
              </div>
              {scheduleMode === "schedule" && (
                <CalendarPicker
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Link href="/posts">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Button>
          </Link>
          <Button
            onClick={() => handleSubmit(scheduleMode)}
            disabled={loading || !isValid}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : scheduleMode === "now" ? (
              <Send className="h-4 w-4" />
            ) : scheduleMode === "schedule" ? (
              <Clock className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading
              ? "Saving..."
              : scheduleMode === "now"
                ? "Publish Now"
                : scheduleMode === "schedule"
                  ? "Schedule"
                  : "Save Draft"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">Platform Previews</Label>
        {uniquePlatforms.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-slate-500">
                Select platforms to see previews
              </p>
            </CardContent>
          </Card>
        ) : (
          uniquePlatforms.map((platform) => {
            const account = accounts.find(
              (a) =>
                selectedAccounts.includes(a.id) && a.platform === platform
            );
            return (
              <PlatformPreview
                key={platform}
                platform={platform}
                content={content}
                accountName={account?.accountName || ""}
                accountHandle={account?.accountHandle || ""}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function PlatformPreview({
  platform,
  content,
  accountName,
  accountHandle,
}: {
  platform: string;
  content: string;
  accountName: string;
  accountHandle: string;
}) {
  const limit = PLATFORM_LIMITS[platform];
  const truncated = limit ? content.slice(0, limit) : content;
  const isOver = limit ? content.length > limit : false;

  if (platform === "TWITTER") {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{accountName}</p>
              <p className="text-xs text-slate-500 truncate">
                @{accountHandle || "handle"}
              </p>
            </div>
          </div>
          <p className="text-sm whitespace-pre-wrap break-words">
            {truncated || (
              <span className="text-slate-400 italic">
                Your post content...
              </span>
            )}
            {isOver && <span className="text-slate-400">...</span>}
          </p>
          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-slate-100">
            <MessageCircle className="h-4 w-4 text-slate-400" />
            <Repeat2 className="h-4 w-4 text-slate-400" />
            <Heart className="h-4 w-4 text-slate-400" />
            <Share className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            <Badge
              className={cn(
                "text-[10px] px-1 py-0",
                PLATFORM_BADGE_CLASSES["TWITTER"]
              )}
            >
              X
            </Badge>{" "}
            Preview &middot; {limit} char limit
          </p>
        </CardContent>
      </Card>
    );
  }

  if (platform === "LINKEDIN") {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{accountName}</p>
              <p className="text-xs text-slate-500">LinkedIn</p>
            </div>
          </div>
          <p className="text-sm whitespace-pre-wrap break-words line-clamp-6">
            {content || (
              <span className="text-slate-400 italic">
                Your post content...
              </span>
            )}
          </p>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" /> Like
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> Comment
            </span>
            <span className="flex items-center gap-1">
              <Repeat2 className="h-3.5 w-3.5" /> Repost
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            <Badge
              className={cn(
                "text-[10px] px-1 py-0",
                PLATFORM_BADGE_CLASSES["LINKEDIN"]
              )}
            >
              in
            </Badge>{" "}
            Preview &middot; {PLATFORM_LIMITS["LINKEDIN"].toLocaleString()} char
            limit
          </p>
        </CardContent>
      </Card>
    );
  }

  if (platform === "INSTAGRAM") {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center mb-3">
            <ImageIcon className="h-8 w-8 text-slate-300" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-5 w-5 text-slate-400" />
            <MessageCircle className="h-5 w-5 text-slate-400" />
            <Send className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm break-words">
            <span className="font-semibold mr-1">
              {accountHandle || accountName}
            </span>
            <span className="whitespace-pre-wrap line-clamp-3">
              {content || (
                <span className="text-slate-400 italic">Your caption...</span>
              )}
            </span>
          </p>
          <p className="text-[10px] text-slate-400 mt-2">
            <Badge
              className={cn(
                "text-[10px] px-1 py-0",
                PLATFORM_BADGE_CLASSES["INSTAGRAM"]
              )}
            >
              ig
            </Badge>{" "}
            Preview &middot; {PLATFORM_LIMITS["INSTAGRAM"].toLocaleString()}{" "}
            char limit
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            className={cn(
              "text-[10px] px-1.5 py-0",
              PLATFORM_BADGE_CLASSES[platform] || "bg-slate-200"
            )}
          >
            {platform.toLowerCase()}
          </Badge>
          <span className="text-sm font-medium truncate">{accountName}</span>
        </div>
        <p className="text-sm whitespace-pre-wrap break-words line-clamp-6">
          {content || (
            <span className="text-slate-400 italic">
              Your post content...
            </span>
          )}
        </p>
        {limit && (
          <p className="text-[10px] text-slate-400 mt-2">
            {limit.toLocaleString()} char limit
          </p>
        )}
      </CardContent>
    </Card>
  );
}
