import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { getSessionToken } from "../../../(core)/lib/githubSession";

export async function GET() {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const octokit = new Octokit({ auth: token });
    const { data: user } = await octokit.users.getAuthenticated();
    return NextResponse.json({
      authenticated: true,
      username: user.login,
      avatarUrl: user.avatar_url,
    });
  } catch (error) {
    // Token is invalid or expired — treat as signed out rather than erroring.
    console.error("Failed to fetch authenticated GitHub user:", error);
    return NextResponse.json({ authenticated: false });
  }
}
