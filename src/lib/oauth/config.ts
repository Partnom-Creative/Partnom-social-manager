import { getPublicBaseUrl } from "@/lib/public-base-url";

export type OAuthPlatformConfig = {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  userInfoUrl: string;
};

export const platformConfig: Record<string, OAuthPlatformConfig> = {
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID ?? "",
    clientSecret: process.env.TWITTER_CLIENT_SECRET ?? "",
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    userInfoUrl: "https://api.twitter.com/2/users/me",
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID ?? "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["openid", "profile", "w_member_social"],
    userInfoUrl: "https://api.linkedin.com/v2/userinfo",
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID ?? "",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET ?? "",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube",
    ],
    userInfoUrl: "https://www.googleapis.com/youtube/v3/channels",
  },
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID ?? "",
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET ?? "",
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
    userInfoUrl: "https://graph.facebook.com/v18.0/me/accounts",
  },
};

export function getRedirectUri(platform: string): string {
  return `${getPublicBaseUrl()}/api/oauth/${platform}/callback`;
}
