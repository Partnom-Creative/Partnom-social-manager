"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Key, Loader2, CheckCircle2 } from "lucide-react";

type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "MEMBER" | "CLIENT";
  organizationId: string;
};

type Organization = {
  id: string;
  name: string;
  slug: string;
};

export default function SettingsPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const [orgName, setOrgName] = useState("");
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgSuccess, setOrgSuccess] = useState(false);
  const [orgError, setOrgError] = useState("");

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        setUser(data.user);
        setOrg(data.organization);
        setOrgName(data.organization?.name ?? "");
        setProfileName(data.user?.name ?? "");
        setProfileEmail(data.user?.email ?? "");
      } catch {
        setOrgError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const isAdmin = user?.role === "ADMIN";

  async function handleOrgSave() {
    setOrgSaving(true);
    setOrgError("");
    setOrgSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      setOrgSuccess(true);
      setTimeout(() => setOrgSuccess(false), 3000);
    } catch (err: any) {
      setOrgError(err.message);
    } finally {
      setOrgSaving(false);
    }
  }

  async function handleProfileSave() {
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess(false);
    try {
      const body: Record<string, string> = { name: profileName };
      if (currentPassword && newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      setProfileSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">
          Manage your account and organization settings
        </p>
      </div>

      <Tabs defaultValue={isAdmin ? "general" : "profile"}>
        <TabsList>
          {isAdmin && (
            <TabsTrigger value="general">
              <Building2 className="mr-1.5 h-4 w-4" />
              General
            </TabsTrigger>
          )}
          <TabsTrigger value="profile">
            <User className="mr-1.5 h-4 w-4" />
            Profile
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="api-keys">
              <Key className="mr-1.5 h-4 w-4" />
              API Keys
            </TabsTrigger>
          )}
        </TabsList>

        {isAdmin && (
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>
                  Manage your organization details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Your organization name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <p className="text-sm font-mono text-slate-500">
                    {org?.slug}
                  </p>
                </div>

                {orgError && (
                  <p className="text-sm text-red-600">{orgError}</p>
                )}

                <div className="flex items-center gap-3">
                  <Button onClick={handleOrgSave} disabled={orgSaving}>
                    {orgSaving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                  {orgSuccess && (
                    <span className="flex items-center gap-1 text-sm text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Saved
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Name</Label>
                <Input
                  id="profile-name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  value={profileEmail}
                  disabled
                  className="bg-slate-50"
                />
                <p className="text-xs text-slate-400">
                  Email cannot be changed
                </p>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                  Change Password
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
              </div>

              {profileError && (
                <p className="text-sm text-red-600">{profileError}</p>
              )}

              <div className="flex items-center gap-3">
                <Button onClick={handleProfileSave} disabled={profileSaving}>
                  {profileSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
                {profileSuccess && (
                  <span className="flex items-center gap-1 text-sm text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Saved
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="api-keys">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CardTitle>API Keys</CardTitle>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
                <CardDescription>
                  Manage API keys for external integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <Key className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">
                    API Keys Coming Soon
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    API keys will allow you to integrate Social Hub with
                    external tools and services. You&apos;ll be able to create,
                    revoke, and manage keys for programmatic access to your
                    organization&apos;s data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
