import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { getAccessibleClientIds } from "@/lib/permissions";
import { PostComposer } from "../post-composer";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const accessibleIds = await getAccessibleClientIds(user.id, user.organizationId, user.role);

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
        <h1 className="text-3xl font-bold tracking-tight">New Post</h1>
        <p className="text-muted-foreground mt-1">
          Compose and publish to social platforms
        </p>
      </div>
      <PostComposer clients={clients} defaultClientId={params.client} />
    </div>
  );
}
