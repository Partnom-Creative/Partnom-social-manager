import { Platform } from "@/generated/prisma/client";
import { PublishResult, PublishInput } from "./base";
import { publishToTwitter } from "./twitter";
import { publishToLinkedIn } from "./linkedin";
import { publishToYouTube } from "./youtube";
import { publishToInstagram } from "./instagram";

type Publisher = (input: PublishInput) => Promise<PublishResult>;

const publishers: Partial<Record<Platform, Publisher>> = {
  [Platform.TWITTER]: publishToTwitter,
  [Platform.LINKEDIN]: publishToLinkedIn,
  [Platform.YOUTUBE]: publishToYouTube,
  [Platform.INSTAGRAM]: publishToInstagram,
};

export function getPublisher(platform: Platform): Publisher {
  if (platform === Platform.SUBSTACK) {
    throw new Error("Substack publishing is not yet supported");
  }

  const publisher = publishers[platform];
  if (!publisher) {
    throw new Error(`No publisher implemented for platform: ${platform}`);
  }
  return publisher;
}

export { type PublishResult, type PublishInput } from "./base";
