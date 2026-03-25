"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function TeamJoinForm({ token }: { token: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/team/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, name: name.trim() || undefined }),
      });
      const data = await res.json().catch(() => ({} as { email?: string }));
      if (!res.ok) {
        toast.error(typeof data.error === "string" ? data.error : "Could not accept invite");
        setLoading(false);
        return;
      }
      const email = typeof data.email === "string" ? data.email : "";
      if (!email) {
        toast.error("Missing email in response");
        setLoading(false);
        return;
      }
      toast.success("Account ready — signing you in…");
      const signRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signRes?.ok) {
        router.replace("/");
        router.refresh();
      } else {
        router.replace("/login");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Set your password</CardTitle>
        <CardDescription>Complete your team invitation to access Social Hub.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Join team
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
