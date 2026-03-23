import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Share2, Clock, AlertCircle } from "lucide-react";
import { ConnectAccountButton } from "./connect-account-button";
import { getAllPlatforms } from "@/lib/oauth/platforms";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await db.clientInvite.findUnique({
    where: { token },
    include: {
      client: {
        include: {
          socialAccounts: {
            select: { platform: true, accountName: true, accountHandle: true },
          },
        },
      },
    },
  });

  if (!invite) notFound();

  const isExpired = invite.expiresAt < new Date();
  const isAccepted = invite.status === "ACCEPTED";

  if (isExpired && invite.status === "PENDING") {
    await db.clientInvite.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });
  }

  const connectedPlatforms = new Map<
    string,
    { name: string; handle: string | null }
  >(
    invite.client.socialAccounts.map((a: { platform: string; accountName: string; accountHandle: string | null }) => [
      a.platform,
      { name: a.accountName, handle: a.accountHandle },
    ]),
  );
  const platforms = getAllPlatforms();
  const connectedCount = platforms.filter((p) =>
    connectedPlatforms.has(p.platform),
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-8">
          {/* Branding */}
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Share2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-indigo-600 tracking-wide uppercase">
              SocialHub
            </p>
          </div>

          {isExpired || isAccepted ? (
            <Card className="shadow-lg border-0 shadow-slate-200/60">
              <CardContent className="py-12 text-center space-y-4">
                {isAccepted ? (
                  <>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                      <AlertCircle className="h-7 w-7 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-slate-900">
                        Invite Already Used
                      </h2>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto">
                        This invite has already been accepted and accounts have
                        been connected for{" "}
                        <strong>{invite.client.name}</strong>.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                      <Clock className="h-7 w-7 text-red-500" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-slate-900">
                        Invite Expired
                      </h2>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto">
                        This invite link has expired. Please contact your agency
                        to request a new one.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Welcome */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Connect your social accounts
                  <br />
                  for{" "}
                  <span style={{ color: invite.client.color || "#6366f1" }}>
                    {invite.client.name}
                  </span>
                </h1>
                <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                  Your agency has invited you to connect your social media
                  accounts. Click the buttons below to securely authorize
                  access. Your login credentials are never shared.
                </p>
              </div>

              {/* Platform buttons */}
              <Card className="shadow-lg border-0 shadow-slate-200/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Social Accounts
                  </CardTitle>
                  <CardDescription>
                    {connectedCount} of {platforms.length} connected
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {platforms.map((p) => {
                    const connected = connectedPlatforms.get(p.platform);
                    return (
                      <ConnectAccountButton
                        key={p.key}
                        platformKey={p.key}
                        platformName={p.name}
                        platformColor={p.color}
                        inviteToken={token}
                        clientId={invite.clientId}
                        isConnected={!!connected}
                        connectedHandle={connected?.handle ?? undefined}
                      />
                    );
                  })}
                </CardContent>
              </Card>

              {/* Security notice */}
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4">
                <Shield className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your credentials are kept secure using industry-standard
                  OAuth 2.0. We never see or store your passwords — only a
                  limited access token is saved to manage posts on your
                  behalf.
                </p>
              </div>

              {/* Expiry */}
              <p className="text-xs text-center text-slate-400">
                This invite expires on{" "}
                {invite.expiresAt.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
