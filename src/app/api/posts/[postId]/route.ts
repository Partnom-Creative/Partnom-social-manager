import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;

  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (post.status === "PUBLISHED" || post.status === "PUBLISHING") {
    return NextResponse.json({ error: "Cannot delete published or publishing posts" }, { status: 400 });
  }

  await db.post.delete({ where: { id: postId } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await params;
  const body = await req.json();

  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (post.status === "PUBLISHED" || post.status === "PUBLISHING") {
    return NextResponse.json({ error: "Cannot edit published posts" }, { status: 400 });
  }

  const updatedPost = await db.post.update({
    where: { id: postId },
    data: {
      ...(body.content !== undefined && { content: body.content }),
      ...(body.scheduledAt !== undefined && {
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        status: body.scheduledAt ? "SCHEDULED" : "DRAFT",
      }),
    },
  });

  if (body.scheduledAt !== undefined) {
    await db.postTarget.updateMany({
      where: { postId },
      data: { status: body.scheduledAt ? "SCHEDULED" : "DRAFT" },
    });
  }

  return NextResponse.json(updatedPost);
}
