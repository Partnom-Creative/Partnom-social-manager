import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { platformConfig } from "@/lib/oauth/config";
import { getPublicBaseUrl } from "@/lib/public-base-url";
import { Platform } from "@/generated/prisma/client";
import * as twitter from "@/lib/oauth/twitter";
import * as linkedin from "@/lib/oauth/linkedin";
import * as youtube from "@/lib/oauth/youtube";
import * as instagram from "@/lib/oauth/instagram";

type OAuthState = {
  clientId: string;
  inviteToken?: string;
  platform: string;
};

type NormalizedProfile = {
  id: string;
  name: string;
  handle: string | null;
  avatarUrl: string | null;
  metadata?: Record<string, string>;
};

type TokenResult = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
};

const PLATFORM_ENUM: Record<string, Platform> = {
  twitter: Platform.TWITTER,
  linkedin: Platform.LINKEDIN,
  youtube: Platform.YOUTUBE,
  instagram: Platform.INSTAGRAM,
};

async function exchangeAndFetchProfile(
  platform: string,
  code: string,
  codeVerifier?: string,
): Promise<{ tokens: TokenResult; profile: NormalizedProfile }> {
  switch (platform) {
    case "twitter": {
      if (!codeVerifier) {
        throw new Error("Missing PKCE code verifier for Twitter");
      }
      const tokens = await twitter.exchangeCode(code, codeVerifier);
      const user = await twitter.getUserProfile(tokens.access_token);
      return {
        tokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in,
        },
        profile: {
          id: user.id,
          name: user.name,
          handle: user.username,
          avatarUrl: user.profile_image_url ?? null,
        },
      };
    }

    case "linkedin": {
      const tokens = await linkedin.exchangeCode(code);
      const user = await linkedin.getUserProfile(tokens.access_token);
      return {
        tokens: {
          accessToken: tokens.access_token,
          expiresIn: tokens.expires_in,
        },
        profile: {
          id: user.sub,
          name: user.name,
          handle: null,
          avatarUrl: user.picture ?? null,
        },
      };
    }

    case "youtube": {
      const tokens = await youtube.exchangeCode(code);
      const channel = await youtube.getChannelInfo(tokens.access_token);
      return {
        tokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in,
        },
        profile: {
          id: channel.id,
          name: channel.title,
          handle: channel.customUrl ?? null,
          avatarUrl: channel.thumbnailUrl ?? null,
        },
      };
    }

    case "instagram": {
      const tokens = await instagram.exchangeCode(code);
      const account = await instagram.getUserProfile(tokens.access_token);
      return {
        tokens: {
          accessToken: tokens.access_token,
          expiresIn: tokens.expires_in,
        },
        profile: {
          id: account.id,
          name: account.username,
          handle: account.username,
          avatarUrl: account.profilePictureUrl ?? null,
          metadata: { pageId: account.pageId, pageName: account.pageName },
        },
      };
    }

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = getPublicBaseUrl();

  if (error || !code || !stateParam) {
    return NextResponse.redirect(
      `${baseUrl}/invite/error?msg=${encodeURIComponent(error || "Missing authorization code")}`,
    );
  }

  const cookieStore = await cookies();

  // Validate state against encrypted cookie
  const encryptedState = cookieStore.get("oauth_state")?.value;
  if (!encryptedState) {
    return NextResponse.redirect(
      `${baseUrl}/invite/error?msg=${encodeURIComponent("Missing OAuth state cookie")}`,
    );
  }

  let storedState: string;
  try {
    storedState = decrypt(encryptedState);
  } catch {
    return NextResponse.redirect(
      `${baseUrl}/invite/error?msg=${encodeURIComponent("Invalid OAuth state")}`,
    );
  }

  if (storedState !== stateParam) {
    return NextResponse.redirect(
      `${baseUrl}/invite/error?msg=${encodeURIComponent("OAuth state mismatch")}`,
    );
  }

  let state: OAuthState;
  try {
    state = JSON.parse(Buffer.from(stateParam, "base64url").toString());
  } catch {
    return NextResponse.redirect(
      `${baseUrl}/invite/error?msg=${encodeURIComponent("Invalid state parameter")}`,
    );
  }

  const platformEnum = PLATFORM_ENUM[platform];
  if (!platformEnum) {
    return NextResponse.redirect(
      `${baseUrl}/invite/error?msg=${encodeURIComponent("Unsupported platform")}`,
    );
  }

  try {
    const codeVerifier =
      platform === "twitter"
        ? cookieStore.get("oauth_code_verifier")?.value
        : undefined;

    const { tokens, profile } = await exchangeAndFetchProfile(
      platform,
      code,
      codeVerifier,
    );

    const config = platformConfig[platform];

    await db.socialAccount.upsert({
      where: {
        platform_platformAccountId: {
          platform: platformEnum,
          platformAccountId: profile.id,
        },
      },
      create: {
        platform: platformEnum,
        platformAccountId: profile.id,
        accountName: profile.name,
        accountHandle: profile.handle,
        avatarUrl: profile.avatarUrl,
        accessToken: encrypt(tokens.accessToken),
        refreshToken: tokens.refreshToken
          ? encrypt(tokens.refreshToken)
          : null,
        tokenExpiresAt: tokens.expiresIn
          ? new Date(Date.now() + tokens.expiresIn * 1000)
          : null,
        scopes: config?.scopes.join(" ") ?? null,
        metadata: profile.metadata ?? undefined,
        clientId: state.clientId,
      },
      update: {
        accountName: profile.name,
        accountHandle: profile.handle,
        avatarUrl: profile.avatarUrl,
        accessToken: encrypt(tokens.accessToken),
        refreshToken: tokens.refreshToken
          ? encrypt(tokens.refreshToken)
          : null,
        tokenExpiresAt: tokens.expiresIn
          ? new Date(Date.now() + tokens.expiresIn * 1000)
          : null,
        metadata: profile.metadata ?? undefined,
      },
    });

    if (state.inviteToken) {
      await db.clientInvite.updateMany({
        where: { token: state.inviteToken, status: "PENDING" },
        data: { status: "ACCEPTED" },
      });
    }

    const redirectUrl = state.inviteToken
      ? `${baseUrl}/invite/${state.inviteToken}?connected=${platform}`
      : `${baseUrl}/clients/${state.clientId}?connected=${platform}`;

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete("oauth_state");
    response.cookies.delete("oauth_code_verifier");
    return response;
  } catch (err) {
    console.error(`OAuth callback error for ${platform}:`, err);
    const redirectUrl = state.inviteToken
      ? `${baseUrl}/invite/${state.inviteToken}?error=connection_failed`
      : `${baseUrl}/clients/${state.clientId}?error=connection_failed`;
    return NextResponse.redirect(redirectUrl);
  }
}
