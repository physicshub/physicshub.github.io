import { NextResponse } from "next/server";
import {
  setSessionToken,
  consumeOAuthState,
} from "../../../../(core)/lib/githubSession";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const returnTo = "/blog/create";

  const expectedState = await consumeOAuthState();
  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(
      new URL(`${returnTo}?auth_error=state_mismatch`, req.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`${returnTo}?auth_error=missing_code`, req.url)
    );
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(`${returnTo}?auth_error=server_not_configured`, req.url)
    );
  }

  try {
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      }
    );

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("GitHub OAuth token exchange failed:", tokenData);
      return NextResponse.redirect(
        new URL(`${returnTo}?auth_error=token_exchange_failed`, req.url)
      );
    }

    await setSessionToken(tokenData.access_token);
    return NextResponse.redirect(new URL(returnTo, req.url));
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(`${returnTo}?auth_error=unexpected`, req.url)
    );
  }
}
