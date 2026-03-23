import { PublishResult, PublishInput } from "./base";

const GRAPH_API = "https://graph.facebook.com/v18.0";

export async function publishToInstagram(
  input: PublishInput
): Promise<PublishResult> {
  try {
    if (input.mediaUrls.length === 0) {
      return {
        success: false,
        error:
          "Instagram requires at least one image URL. Text-only posts are not supported.",
      };
    }

    const igUserId = input.platformAccountId;
    if (!igUserId) {
      return {
        success: false,
        error: "Instagram user ID (platformAccountId) is required",
      };
    }

    // Step 1: Create media container
    const containerRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: input.mediaUrls[0],
        caption: input.content,
        access_token: input.accessToken,
      }),
    });

    if (!containerRes.ok) {
      const body = await containerRes.text();
      return {
        success: false,
        error: `Instagram container creation failed (${containerRes.status}): ${body}`,
      };
    }

    const container = await containerRes.json();

    // Step 2: Publish the container
    const publishRes = await fetch(
      `${GRAPH_API}/${igUserId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: input.accessToken,
        }),
      }
    );

    if (!publishRes.ok) {
      const body = await publishRes.text();
      return {
        success: false,
        error: `Instagram publish failed (${publishRes.status}): ${body}`,
      };
    }

    const result = await publishRes.json();
    return { success: true, platformPostId: result.id };
  } catch (error) {
    return {
      success: false,
      error: `Instagram publish failed: ${(error as Error).message}`,
    };
  }
}
