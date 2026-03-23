import { NextResponse } from "next/server";
import { platformConfig } from "@/lib/oauth/config";
import { encrypt } from "@/lib/encryption";
import * as twitter from "@/lib/oauth/twitter";
import * as linkedin from "@/lib/oauth/linkedin";
import * as youtube from "@/lib/oauth/youtube";
import * as instagram from "@/lib/oauth/instagram";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  const config = platformConfig[platform];

  if (!config) {
    return NextResponse.json(
      { error: "Unsupported platform" },
      { status: 400 },
    );
  }

  if (!config.clientId) {
    return NextResponse.json(
      { error: `${platform} OAuth is not configured` },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId") ?? "";
  const inviteToken = searchParams.get("inviteToken") || undefined;

  if (!clientId) {
    return NextResponse.json(
      { error: "clientId query parameter is required" },
      { status: 400 },
    );
  }

  const state = Buffer.from(
    JSON.stringify({ clientId, inviteToken, platform }),
  ).toString("base64url");

  let authUrl: string;
  let codeVerifier: string | undefined;

  switch (platform) {
    case "twitter": {
      const result = twitter.getAuthUrl(state);
      authUrl = result.url;
      codeVerifier = result.codeVerifier;
      break;
    }
    case "linkedin":
      authUrl = linkedin.getAuthUrl(state);
      break;
    case "youtube":
      authUrl = youtube.getAuthUrl(state);
      break;
    case "instagram":
      authUrl = instagram.getAuthUrl(state);
      break;
    default:
      return NextResponse.json(
        { error: "Unsupported platform" },
        { status: 400 },
      );
  }

  const response = NextResponse.redirect(authUrl);

  response.cookies.set("oauth_state", encrypt(state), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  if (codeVerifier) {
    response.cookies.set("oauth_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });
  }

  return response;
}
