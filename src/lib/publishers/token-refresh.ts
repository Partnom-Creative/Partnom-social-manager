import { SocialAccount, Platform } from "@/generated/prisma";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { platformConfig } from "@/lib/oauth/config";

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
};

export async function refreshTokenIfNeeded(
  account: SocialAccount
): Promise<{ accessToken: string; refreshed: boolean }> {
  const now = Date.now();
  const expiresAt = account.tokenExpiresAt?.getTime();
  const needsRefresh = expiresAt && expiresAt - now < REFRESH_BUFFER_MS;

  if (!needsRefresh) {
    return { accessToken: decrypt(account.accessToken), refreshed: false };
  }

  if (account.platform === Platform.INSTAGRAM) {
    return refreshInstagramToken(account);
  }

  if (!account.refreshToken) {
    return { accessToken: decrypt(account.accessToken), refreshed: false };
  }

  const platformKey = account.platform.toLowerCase();
  const config = platformConfig[platformKey];
  if (!config) {
    throw new Error(`No OAuth config for platform: ${account.platform}`);
  }

  const decryptedRefreshToken = decrypt(account.refreshToken);

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: decryptedRefreshToken,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (account.platform === Platform.TWITTER) {
    // Twitter confidential clients authenticate via Basic auth
    const credentials = Buffer.from(
      `${config.clientId}:${config.clientSecret}`
    ).toString("base64");
    headers["Authorization"] = `Basic ${credentials}`;
  } else {
    body.set("client_id", config.clientId);
    body.set("client_secret", config.clientSecret);
  }

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers,
    body: body.toString(),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(
      `Token refresh failed for ${account.platform} (${res.status}): ${errBody}`
    );
  }

  const tokenData: TokenResponse = await res.json();
  return persistRefreshedTokens(account, tokenData);
}

async function refreshInstagramToken(
  account: SocialAccount
): Promise<{ accessToken: string; refreshed: boolean }> {
  // Instagram long-lived tokens are refreshed via GET with the current token
  const currentToken = decrypt(account.accessToken);
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", currentToken);

  const res = await fetch(url.toString());

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(
      `Instagram token refresh failed (${res.status}): ${errBody}`
    );
  }

  const tokenData: TokenResponse = await res.json();
  return persistRefreshedTokens(account, tokenData);
}

async function persistRefreshedTokens(
  account: SocialAccount,
  tokenData: TokenResponse
): Promise<{ accessToken: string; refreshed: boolean }> {
  const newExpiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000)
    : undefined;

  await db.socialAccount.update({
    where: { id: account.id },
    data: {
      accessToken: encrypt(tokenData.access_token),
      ...(tokenData.refresh_token && {
        refreshToken: encrypt(tokenData.refresh_token),
      }),
      ...(newExpiresAt && { tokenExpiresAt: newExpiresAt }),
    },
  });

  return { accessToken: tokenData.access_token, refreshed: true };
}
