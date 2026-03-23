import { platformConfig, getRedirectUri } from "./config";

export type YouTubeTokens = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

export type YouTubeChannel = {
  id: string;
  title: string;
  customUrl?: string;
  thumbnailUrl?: string;
};

export function getAuthUrl(state: string): string {
  const config = platformConfig.youtube;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: getRedirectUri("youtube"),
    scope: config.scopes.join(" "),
    state,
    access_type: "offline",
    prompt: "consent",
  });

  return `${config.authUrl}?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<YouTubeTokens> {
  const config = platformConfig.youtube;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri("youtube"),
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube token exchange failed: ${text}`);
  }

  return res.json();
}

export async function getChannelInfo(
  accessToken: string,
): Promise<YouTubeChannel> {
  const res = await fetch(
    `${platformConfig.youtube.userInfoUrl}?part=snippet&mine=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube channel info fetch failed: ${text}`);
  }

  const data = await res.json();
  const channel = data.items?.[0];

  if (!channel) {
    throw new Error("No YouTube channel found for this account");
  }

  return {
    id: channel.id,
    title: channel.snippet.title,
    customUrl: channel.snippet.customUrl,
    thumbnailUrl: channel.snippet.thumbnails?.default?.url,
  };
}
