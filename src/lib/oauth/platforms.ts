import { Platform } from "@/generated/prisma/client";

export type PlatformConfig = {
  name: string;
  platform: Platform;
  icon: string;
  color: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnv: string;
  clientSecretEnv: string;
};

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  twitter: {
    name: "X (Twitter)",
    platform: Platform.TWITTER,
    icon: "twitter",
    color: "#000000",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    clientIdEnv: "TWITTER_CLIENT_ID",
    clientSecretEnv: "TWITTER_CLIENT_SECRET",
  },
  linkedin: {
    name: "LinkedIn",
    platform: Platform.LINKEDIN,
    icon: "linkedin",
    color: "#0A66C2",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["openid", "profile", "w_member_social"],
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
  },
  youtube: {
    name: "YouTube",
    platform: Platform.YOUTUBE,
    icon: "youtube",
    color: "#FF0000",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly",
    ],
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
  },
  instagram: {
    name: "Instagram",
    platform: Platform.INSTAGRAM,
    icon: "instagram",
    color: "#E4405F",
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    scopes: [
      "instagram_basic",
      "instagram_content_publish",
      "pages_show_list",
      "pages_read_engagement",
    ],
    clientIdEnv: "META_APP_ID",
    clientSecretEnv: "META_APP_SECRET",
  },
};

export function getPlatformConfig(platform: string): PlatformConfig | undefined {
  return PLATFORM_CONFIGS[platform.toLowerCase()];
}

export function getAllPlatforms() {
  return Object.entries(PLATFORM_CONFIGS).map(([key, config]) => ({
    key,
    ...config,
  }));
}
