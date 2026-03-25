"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthFormCard } from "@/components/auth-form-card";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email,
          password,
          orgName: formData.get("orgName"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error || result?.ok === false) {
        window.location.href = "/login?registered=true";
        return;
      }

      window.location.href = "/";
    } catch (err) {
      console.error("[register-form] error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthFormCard className="gap-0 p-0">
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4 p-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orgName">Company Name</Label>
              <Input id="orgName" name="orgName" placeholder="Acme Inc." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" name="name" placeholder="Jane Doe" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@agency.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              required
              minLength={8}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 border-t border-white/10 bg-transparent">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </AuthFormCard>
  );
}
