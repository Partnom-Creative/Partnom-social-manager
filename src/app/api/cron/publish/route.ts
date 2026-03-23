import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPublisher } from "@/lib/publishers";
import { refreshTokenIfNeeded } from "@/lib/publishers/token-refresh";

const MAX_POSTS_PER_RUN = 10;
const MAX_RETRIES = 3;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const duePosts = await db.post.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: new Date() },
      retryCount: { lt: MAX_RETRIES },
    },
    include: {
      targets: {
        where: { status: { not: "PUBLISHED" } },
        include: { socialAccount: true },
      },
    },
    take: MAX_POSTS_PER_RUN,
    orderBy: { scheduledAt: "asc" },
  });

  const results = [];

  for (const post of duePosts) {
    if (post.targets.length === 0) {
      await db.post.update({
        where: { id: post.id },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
      results.push({
        postId: post.id,
        status: "PUBLISHED",
        targetsProcessed: 0,
        succeeded: 0,
        failed: 0,
      });
      continue;
    }

    await db.post.update({
      where: { id: post.id },
      data: { status: "PUBLISHING" },
    });

    const targetResults: {
      targetId: string;
      platform: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (const target of post.targets) {
      try {
        const { accessToken } = await refreshTokenIfNeeded(
          target.socialAccount
        );

        const publisher = getPublisher(target.socialAccount.platform);
        const result = await publisher({
          content: post.content,
          mediaUrls: post.mediaUrls,
          accessToken,
          platformAccountId: target.socialAccount.platformAccountId,
        });

        await db.postTarget.update({
          where: { id: target.id },
          data: {
            status: result.success ? "PUBLISHED" : "FAILED",
            platformPostId: result.platformPostId,
            errorMsg: result.error,
            publishedAt: result.success ? new Date() : undefined,
          },
        });

        targetResults.push({
          targetId: target.id,
          platform: target.socialAccount.platform,
          success: result.success,
          error: result.error,
        });
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : String(error);

        await db.postTarget.update({
          where: { id: target.id },
          data: { status: "FAILED", errorMsg },
        });

        targetResults.push({
          targetId: target.id,
          platform: target.socialAccount.platform,
          success: false,
          error: errorMsg,
        });
      }
    }

    const succeeded = targetResults.filter((r) => r.success).length;
    const failed = targetResults.filter((r) => !r.success).length;
    const allSucceeded = failed === 0;

    let postStatus: "PUBLISHED" | "FAILED";
    let errorMsg: string | null = null;

    if (allSucceeded) {
      postStatus = "PUBLISHED";
    } else if (succeeded === 0) {
      postStatus = "FAILED";
      const errors = targetResults
        .map((r) => `${r.platform}: ${r.error}`)
        .join("; ");
      errorMsg = `All ${failed} target(s) failed — ${errors}`;
    } else {
      postStatus = "FAILED";
      errorMsg = `Partial failure: ${succeeded}/${targetResults.length} published, ${failed} failed`;
    }

    await db.post.update({
      where: { id: post.id },
      data: {
        status: postStatus,
        publishedAt: allSucceeded ? new Date() : undefined,
        errorMsg,
        retryCount: failed > 0 ? { increment: 1 } : undefined,
      },
    });

    results.push({
      postId: post.id,
      status: postStatus,
      targetsProcessed: targetResults.length,
      succeeded,
      failed,
    });
  }

  console.log(
    `[cron/publish] Processed ${results.length} post(s):`,
    JSON.stringify(results)
  );

  return NextResponse.json({
    processed: results.length,
    results,
    timestamp: new Date().toISOString(),
  });
}
