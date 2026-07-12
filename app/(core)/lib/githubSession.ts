import { cookies } from "next/headers";

const SESSION_COOKIE = "gh_session";

// The cookie value is just the GitHub access token. It's set as an
// httpOnly, secure, sameSite=lax cookie so it's never readable from
// client-side JS, but is still sent on the top-level OAuth redirect.
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionToken(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function clearSessionToken() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

const OAUTH_STATE_COOKIE = "gh_oauth_state";

export async function setOAuthState(state: string) {
  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes — just long enough for the OAuth round trip
  });
}

export async function consumeOAuthState(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(OAUTH_STATE_COOKIE)?.value ?? null;
  store.delete(OAUTH_STATE_COOKIE);
  return value;
}
