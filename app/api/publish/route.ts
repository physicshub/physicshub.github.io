import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, jsonContent } = body;

    if (!title?.trim() || !jsonContent) {
      return NextResponse.json(
        { success: false, error: "Missing title or content" },
        { status: 400 }
      );
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    
    const owner = "AgnibhaDebnath"; // TODO: Replace with authenticated GitHub username once OAuth is implemented
    const repo = "physicshub.github.io";

    // Generate a clean slug
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const fileName = `content/blogs/${slug}-${Date.now()}.json`;
    const branchName = `blog-proposal-${slug}-${Math.floor(Math.random() * 1000)}`;

    // 1. Get the reference to the main branch
    const { data: mainBranch } = await octokit.git.getRef({
      owner,
      repo,
      ref: "heads/main",
    });

    // 2. Create a new branch for the proposal
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: mainBranch.object.sha,
    });

   // 3. Create the file in the new branch
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: fileName,
      message: `New blog proposal: ${title}`,
      content: Buffer.from(JSON.stringify(jsonContent)).toString("base64"),
      branch: branchName,
    });

    // 4. Open the Pull Request
    const { data: pr } = await octokit.pulls.create({
      owner:"physicshub",
      repo,
      title: `📝 Blog Proposal: ${title}`,
      head: `${owner}:${branchName}`,
      base: "main",
      body: `New blog proposal submitted through the website editor.\n\nTitle: ${title}`
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
