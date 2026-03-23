import { PublishResult, PublishInput } from "./base";

export async function publishToTwitter(
  input: PublishInput
): Promise<PublishResult> {
  try {
    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input.content }),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        success: false,
        error: `Twitter API ${response.status}: ${body}`,
      };
    }

    const data = await response.json();
    return { success: true, platformPostId: data.data?.id };
  } catch (error) {
    return {
      success: false,
      error: `Twitter publish failed: ${(error as Error).message}`,
    };
  }
}
