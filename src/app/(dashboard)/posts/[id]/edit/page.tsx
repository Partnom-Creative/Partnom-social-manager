import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { getAccessibleClientIds } from "@/lib/permissions";
import { PostComposer } from "../../post-composer";
import { notFound, redirect } from "next/navigation";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await params;
  const accessibleIds = await getAccessibleClientIds(user.id, user.organizationId, user.role);

  const post = await db.post.findUnique({
    where: { id },
    include: {
      targets: {
        include: {
          socialAccount: {
            select: {
              id: true,
              platform: true,
              accountName: true,
              accountHandle: true,
            },
          },
        },
      },
    },
  });

  if (!post) notFound();

  if (!accessibleIds.includes(post.clientId)) {
    notFound();
  }

  if (post.status !== "DRAFT" && post.status !== "SCHEDULED") {
    redirect(`/posts/${id}`);
  }

  const clients = await db.client.findMany({
    where: {
      organizationId: user.organizationId,
      id: { in: accessibleIds },
    },
    include: {
      socialAccounts: {
        select: {
          id: true,
          platform: true,
          accountName: true,
          accountHandle: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
        <p className="text-muted-foreground mt-1">
          Update your post before publishing
        </p>
      </div>
      <PostComposer
        clients={clients}
        initialData={{
          id: post.id,
          content: post.content,
          mediaUrls: post.mediaUrls,
          status: post.status,
          scheduledAt: post.scheduledAt?.toISOString() ?? null,
          clientId: post.clientId,
          targets: post.targets.map((t) => ({
            socialAccountId: t.socialAccountId,
            socialAccount: t.socialAccount,
          })),
        }}
      />
    </div>
  );
}
