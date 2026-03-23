import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { getUserAccessLevel } from "@/lib/permissions";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, PenSquare, Users, Mail, ExternalLink } from "lucide-react";
import Link from "next/link";
import { SendInviteDialog } from "./send-invite-dialog";
import { format } from "date-fns";

const platformIcons: Record<string, string> = {
  TWITTER: "𝕏",
  LINKEDIN: "in",
  YOUTUBE: "▶",
  INSTAGRAM: "📷",
  SUBSTACK: "✉",
};

export default async function ClientDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireAuth();
  const { slug } = await params;

  const client = await db.client.findFirst({
    where: { slug, organizationId: user.organizationId },
    include: {
      socialAccounts: {
        select: { id: true, platform: true, accountName: true, accountHandle: true, avatarUrl: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      invites: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      posts: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { posts: true, teamAccess: true, socialAccounts: true } },
    },
  });

  if (!client) notFound();

  const accessLevel = await getUserAccessLevel(user.id, client.id, user.role);
  if (!accessLevel) redirect("/clients");

  const canManage = accessLevel === "MANAGE";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div
          className="h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: client.color || "#6366f1" }}
        >
          {client.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground">
            {client._count.socialAccounts} accounts &middot; {client._count.posts} posts
          </p>
        </div>
        {canManage && (
          <div className="ml-auto">
            <SendInviteDialog clientId={client.id} clientName={client.name} />
          </div>
        )}
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">
            <Share2 className="mr-1.5 h-4 w-4" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="posts">
            <PenSquare className="mr-1.5 h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="invites">
            <Mail className="mr-1.5 h-4 w-4" />
            Invites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          {client.socialAccounts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Share2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No accounts connected yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Send an invite to the client to connect their accounts.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {client.socialAccounts.map((account) => (
                <Card key={account.id}>
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg">
                      {platformIcons[account.platform] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{account.accountName}</p>
                      {account.accountHandle && (
                        <p className="text-sm text-muted-foreground truncate">@{account.accountHandle}</p>
                      )}
                    </div>
                    <Badge variant="secondary">{account.platform.toLowerCase()}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {client.posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <PenSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No posts yet.</p>
                <Link href={`/posts?client=${client.id}`}>
                  <Button variant="outline" className="mt-3">Create a Post</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {client.posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="py-4">
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Badge variant={
                        post.status === "PUBLISHED" ? "default" :
                        post.status === "SCHEDULED" ? "secondary" :
                        post.status === "FAILED" ? "destructive" : "outline"
                      } className="text-xs">
                        {post.status.toLowerCase()}
                      </Badge>
                      <span>by {post.author.name}</span>
                      <span>{format(new Date(post.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          {client.invites.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No invites sent yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {client.invites.map((invite) => (
                <Card key={invite.id}>
                  <CardContent className="flex items-center gap-3 py-4">
                    <div className="flex-1">
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Sent {format(new Date(invite.createdAt), "MMM d, yyyy")} &middot; Expires {format(new Date(invite.expiresAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant={
                      invite.status === "ACCEPTED" ? "default" :
                      invite.status === "EXPIRED" ? "destructive" : "secondary"
                    }>
                      {invite.status.toLowerCase()}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
