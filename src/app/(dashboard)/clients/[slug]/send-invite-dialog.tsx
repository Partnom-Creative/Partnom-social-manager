"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SendInviteDialog({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  async function onSend() {
    if (!email.trim()) return;
    setLoading(true);

    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), clientId }),
    });

    if (res.ok) {
      const data = await res.json();
      toast.success("Invite sent successfully");
      setOpen(false);
      setEmail("");
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to send invite");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Mail className="mr-2 h-4 w-4" />
        Send Invite
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Client to Connect Accounts</DialogTitle>
          <DialogDescription>
            Send an invite to {clientName}&apos;s contact. They&apos;ll be able to securely connect their social media accounts via OAuth — no credentials are shared with you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Client Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="client@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onSend} disabled={loading || !email.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
