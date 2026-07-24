import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { setOAuthState } from "../../../(core)/lib/githubSession";

export async function GET(req: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "GitHub OAuth is not configured on this server (missing GITHUB_CLIENT_ID).",
      },
      { status: 500 }
    );
  }

  // CSRF protection: generate a random state, store it server-side,
  // and verify it matches on the callback before exchanging the code.
  const state = randomBytes(16).toString("hex");
  await setOAuthState(state);

  const redirectUri = new URL("/api/auth/github/callback", req.url).toString();

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "public_repo");
  authorizeUrl.searchParams.set("state", state);

  return NextResponse.redirect(authorizeUrl.toString());
}
