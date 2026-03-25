import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TeamJoinForm } from "./team-join-form";
import { InviteStatus } from "@/generated/prisma/client";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default async function TeamJoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await db.teamInvite.findUnique({
    where: { token },
    include: { organization: { select: { name: true } } },
  });

  if (!invite) notFound();

  const expired = invite.expiresAt < new Date();
  const used = invite.status === InviteStatus.ACCEPTED;

  if (used) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground text-center">This invitation has already been accepted.</p>
        <Link href="/login" className={cn(buttonVariants())}>
          Sign in
        </Link>
      </div>
    );
  }

  if (expired || invite.status === InviteStatus.EXPIRED) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground text-center">This invitation has expired.</p>
        <Link href="/login" className={cn(buttonVariants())}>
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-muted/30 p-6">
      <p className="text-sm text-muted-foreground mb-6">
        Join <span className="font-medium text-foreground">{invite.organization.name}</span> · {invite.email}
      </p>
      <TeamJoinForm token={token} />
    </div>
  );
}
