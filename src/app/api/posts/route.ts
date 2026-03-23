import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAccessibleClientIds, requireAccess } from "@/lib/permissions";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const status = searchParams.get("status");

  const clientIds = await getAccessibleClientIds(user.id, user.organizationId, user.role);

  const where: any = { clientId: { in: clientIds } };
  if (clientId && clientIds.includes(clientId)) where.clientId = clientId;
  if (status) where.status = status;

  const posts = await db.post.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, color: true, slug: true } },
      author: { select: { id: true, name: true } },
      targets: {
        include: { socialAccount: { select: { id: true, platform: true, accountName: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as any;

  const { content, clientId, accountIds, scheduledAt, publishNow } = await req.json();

  if (!content || !clientId || !accountIds?.length) {
    return NextResponse.json({ error: "Content, client, and at least one account are required" }, { status: 400 });
  }

  const hasAccess = await requireAccess(user.id, clientId, user.role, "CREATE");
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const accounts = await db.socialAccount.findMany({
    where: { id: { in: accountIds }, clientId },
  });

  if (accounts.length === 0) {
    return NextResponse.json({ error: "No valid accounts selected" }, { status: 400 });
  }

  const postStatus = publishNow ? "SCHEDULED" : scheduledAt ? "SCHEDULED" : "DRAFT";
  const scheduleTime = publishNow ? new Date() : scheduledAt ? new Date(scheduledAt) : null;

  const post = await db.post.create({
    data: {
      content,
      status: postStatus,
      scheduledAt: scheduleTime,
      clientId,
      authorId: user.id,
      targets: {
        create: accounts.map((a) => ({
          socialAccountId: a.id,
          status: postStatus,
        })),
      },
    },
    include: {
      targets: {
        include: { socialAccount: { select: { platform: true, accountName: true } } },
      },
    },
  });

  return NextResponse.json(post, { status: 201 });
}
