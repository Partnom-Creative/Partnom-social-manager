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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatRoleLabel } from "@/lib/format-role";

export function AddMemberDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", role: "MEMBER" as "ADMIN" | "EDITOR" | "MEMBER" });

  async function onSubmit() {
    if (!form.email.trim()) return;
    setLoading(true);

    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email.trim(), role: form.role }),
    });

    if (res.ok) {
      toast.success("Invitation sent — they can set their password from the email");
      setOpen(false);
      setForm({ email: "", role: "MEMBER" });
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
        <Plus className="mr-2 h-4 w-4" />
        Add Member
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite team member</DialogTitle>
          <DialogDescription>
            We&apos;ll email them a link to create their password and join your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="teammate@agency.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label className="normal-case">Role</Label>
            <Select
              value={form.role}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  role: (v as "ADMIN" | "EDITOR" | "MEMBER") ?? "MEMBER",
                }))
              }
            >
              <SelectTrigger className="w-full normal-case">
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
            <p className="text-xs leading-relaxed text-muted-foreground normal-case">
              Admins have full org access. Managers lead assigned clients. Editors post only on assigned
              clients.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => void onSubmit()} disabled={loading || !form.email.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
