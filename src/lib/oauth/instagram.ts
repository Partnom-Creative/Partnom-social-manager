import { platformConfig, getRedirectUri } from "./config";

export type InstagramTokens = {
  access_token: string;
  token_type: string;
  expires_in?: number;
};

export type InstagramAccount = {
  id: string;
  username: string;
  profilePictureUrl?: string;
  pageId: string;
  pageName: string;
};

export function getAuthUrl(state: string): string {
  const config = platformConfig.instagram;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: getRedirectUri("instagram"),
    scope: config.scopes.join(","),
    state,
  });

  return `${config.authUrl}?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<InstagramTokens> {
  const config = platformConfig.instagram;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri("instagram"),
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const shortRes = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!shortRes.ok) {
    const text = await shortRes.text();
    throw new Error(`Instagram token exchange failed: ${text}`);
  }

  const shortLived: { access_token: string; token_type: string } =
    await shortRes.json();

  // Exchange short-lived token for long-lived token (~60 days)
  const longParams = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    fb_exchange_token: shortLived.access_token,
  });

  const longRes = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?${longParams.toString()}`,
  );

  if (!longRes.ok) {
    const text = await longRes.text();
    throw new Error(`Instagram long-lived token exchange failed: ${text}`);
  }

  return longRes.json();
}

export async function getUserProfile(
  accessToken: string,
): Promise<InstagramAccount> {
  const pagesRes = await fetch(
    `${platformConfig.instagram.userInfoUrl}?access_token=${accessToken}`,
  );

  if (!pagesRes.ok) {
    const text = await pagesRes.text();
    throw new Error(`Instagram pages fetch failed: ${text}`);
  }

  const pagesData = await pagesRes.json();
  const page = pagesData.data?.[0];

  if (!page) {
    throw new Error(
      "No Facebook Page found. An Instagram Business account requires a linked Facebook Page.",
    );
  }

  const igRes = await fetch(
    `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account{id,username,profile_picture_url,name}&access_token=${accessToken}`,
  );

  if (!igRes.ok) {
    const text = await igRes.text();
    throw new Error(`Instagram business account fetch failed: ${text}`);
  }

  const igData = await igRes.json();
  const ig = igData.instagram_business_account;

  if (!ig) {
    throw new Error(
      "No Instagram Business account linked to this Facebook Page.",
    );
  }

  return {
    id: ig.id,
    username: ig.username ?? page.name,
    profilePictureUrl: ig.profile_picture_url,
    pageId: page.id,
    pageName: page.name,
  };
}
