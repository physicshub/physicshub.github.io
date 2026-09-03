import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import prettier from "prettier";
import { getSessionToken } from "../../(core)/lib/githubSession";

const UPSTREAM_OWNER = "physicshub";
const REPO = "physicshub.github.io";

// Forking is asynchronous on GitHub's side — right after createFork(),
// the fork may not be immediately ready to accept getRef()/createRef() calls.
// Poll briefly until it's available rather than failing outright.
async function waitForForkReady(
  octokit: Octokit,
  owner: string,
  repo: string,
  attempts = 6
) {
  for (let i = 0; i < attempts; i++) {
    try {
      await octokit.git.getRef({ owner, repo, ref: "heads/main" });
      return; // fork is ready
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  throw new Error(
    "Timed out waiting for your fork to become ready. Please try again in a moment."
  );
}

async function ensureForkExists(octokit: Octokit, username: string) {
  try {
    await octokit.repos.get({ owner: username, repo: REPO });
    // Fork already exists, nothing to do.
  } catch {
    await octokit.repos.createFork({ owner: UPSTREAM_OWNER, repo: REPO });
    await waitForForkReady(octokit, username, REPO);
  }
}

export async function POST(req: Request) {
  try {
    const token = await getSessionToken();
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "You need to sign in with GitHub before publishing.",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { jsonContent } = body;
    if (
      !jsonContent ||
      !jsonContent.title?.trim() ||
      !jsonContent.desc?.trim() ||
      !jsonContent.tags ||
      jsonContent.tags.length < 2
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, description, and at least 2 tags are required",
        },
        { status: 400 }
      );
    }
    const { title } = jsonContent;

    const octokit = new Octokit({ auth: token });

    // Determine the contributor's own GitHub identity from their token,
    // rather than a hardcoded username.
    const { data: authenticatedUser } = await octokit.users.getAuthenticated();
    const owner = authenticatedUser.login;

    await ensureForkExists(octokit, owner);

    // Generate a clean slug
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const fileName = `content/blogs/${slug}-${Date.now()}.json`;
    const branchName = `blog-proposal-${slug}-${Math.floor(Math.random() * 1000)}`;
    // Add generated metadata to the blog content
    const blogData = {
      id: Date.now(),
      slug,
      ...jsonContent,
    };
    // Format the JSON according to project Prettier rules
    const formattedContent = await prettier.format(JSON.stringify(blogData), {
      parser: "json",
    });

    // 1. Get the latest commit from upstream's main, so the proposal branches
    //    from fresh code rather than a potentially stale fork.
    const { data: upstreamMain } = await octokit.git.getRef({
      owner: UPSTREAM_OWNER,
      repo: REPO,
      ref: "heads/main",
    });

    // 2. Create a new branch in the contributor's fork
    await octokit.git.createRef({
      owner,
      repo: REPO,
      ref: `refs/heads/${branchName}`,
      sha: upstreamMain.object.sha,
    });

    // 3. Create the file in the new branch
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo: REPO,
      path: fileName,
      message: `New blog proposal: ${title}`,
      content: Buffer.from(formattedContent).toString("base64"),
      branch: branchName,
    });

    // 4. Open the Pull Request against upstream
    const { data: pr } = await octokit.pulls.create({
      owner: UPSTREAM_OWNER,
      repo: REPO,
      title: `📝 Blog Proposal: ${title}`,
      head: `${owner}:${branchName}`,
      base: "main",
      body: `New blog proposal submitted through the website editor by @${owner}.\n\nTitle: ${title}`,
    });

    return NextResponse.json({ success: true, url: pr.html_url });
  } catch (error: unknown) {
    console.error("GitHub API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests from github.io
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://physicshub.github.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
