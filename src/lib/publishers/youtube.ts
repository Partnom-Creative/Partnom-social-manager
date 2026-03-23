import { PublishResult, PublishInput } from "./base";

export async function publishToYouTube(
  input: PublishInput
): Promise<PublishResult> {
  // The YouTube Data API does not support community posts.
  // Video uploads require multipart file handling that isn't feasible
  // through a simple REST call with a URL alone.
  const hasVideoUrl = input.mediaUrls.some((url) =>
    /\.(mp4|mov|avi|wmv|webm|mkv)(\?|$)/i.test(url)
  );

  if (hasVideoUrl) {
    return {
      success: false,
      error:
        "YouTube video upload is not yet implemented. " +
        "Full upload requires resumable multipart streaming which will be added in a future release.",
    };
  }

  return {
    success: false,
    error:
      "YouTube publishing is not yet supported. " +
      "The YouTube Data API does not expose community posts, and video upload requires file streaming.",
  };
}
