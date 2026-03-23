import crypto from "crypto";
import { platformConfig, getRedirectUri } from "./config";

export type TwitterTokens = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope: string;
};

export type TwitterUser = {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
};

export function generatePKCE(): {
  codeVerifier: string;
  codeChallenge: string;
} {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return { codeVerifier, codeChallenge };
}

export function getAuthUrl(state: string): {
  url: string;
  codeVerifier: string;
} {
  const config = platformConfig.twitter;
  const { codeVerifier, codeChallenge } = generatePKCE();

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: getRedirectUri("twitter"),
    scope: config.scopes.join(" "),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return {
    url: `${config.authUrl}?${params.toString()}`,
    codeVerifier,
  };
}

export async function exchangeCode(
  code: string,
  codeVerifier: string,
): Promise<TwitterTokens> {
  const config = platformConfig.twitter;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri("twitter"),
    client_id: config.clientId,
    code_verifier: codeVerifier,
  });

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twitter token exchange failed: ${text}`);
  }

  return res.json();
}

export async function getUserProfile(
  accessToken: string,
): Promise<TwitterUser> {
  const res = await fetch(
    `${platformConfig.twitter.userInfoUrl}?user.fields=profile_image_url,username`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twitter profile fetch failed: ${text}`);
  }

  const data = await res.json();
  return data.data;
}
