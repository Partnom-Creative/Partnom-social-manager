import { platformConfig, getRedirectUri } from "./config";

export type LinkedInTokens = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
};

export type LinkedInUser = {
  sub: string;
  name: string;
  email?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
};

export function getAuthUrl(state: string): string {
  const config = platformConfig.linkedin;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: getRedirectUri("linkedin"),
    scope: config.scopes.join(" "),
    state,
  });

  return `${config.authUrl}?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<LinkedInTokens> {
  const config = platformConfig.linkedin;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri("linkedin"),
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
    throw new Error(`LinkedIn token exchange failed: ${text}`);
  }

  return res.json();
}

export async function getUserProfile(
  accessToken: string,
): Promise<LinkedInUser> {
  const res = await fetch(platformConfig.linkedin.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LinkedIn profile fetch failed: ${text}`);
  }

  return res.json();
}
