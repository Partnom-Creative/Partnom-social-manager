import { PublishResult, PublishInput } from "./base";

export async function publishToLinkedIn(
  input: PublishInput
): Promise<PublishResult> {
  try {
    if (!input.platformAccountId) {
      return {
        success: false,
        error: "LinkedIn requires platformAccountId (urn:li:person:XXX)",
      };
    }

    // platformAccountId should already be stored as "urn:li:person:XXX"
    const authorUrn = input.platformAccountId.startsWith("urn:li:")
      ? input.platformAccountId
      : `urn:li:person:${input.platformAccountId}`;

    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: input.content },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        success: false,
        error: `LinkedIn API ${response.status}: ${body}`,
      };
    }

    const data = await response.json();
    return { success: true, platformPostId: data.id };
  } catch (error) {
    return {
      success: false,
      error: `LinkedIn publish failed: ${(error as Error).message}`,
    };
  }
}
