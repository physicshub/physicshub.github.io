import { NextResponse } from 'next/server';
import { Octokit } from "@octokit/rest";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, jsonContent } = body;

    if (!title || !jsonContent) {
      return NextResponse.json(
        { success: false, error: "Missing title or content" },
        { status: 400 }
      );
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    const owner = "physicshub"; 
    const repo = "physicshub.github.io";
    
    // Genera uno slug pulito
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
      
    const fileName = `content/blogs/${slug}-${Date.now()}.json`;
    const branchName = `blog-proposal-${slug}-${Math.floor(Math.random() * 1000)}`;

    // 1. Prendi il riferimento al branch principale (main)
    const { data: mainBranch } = await octokit.git.getRef({ 
      owner, 
      repo, 
      ref: 'heads/main' 
    });

    // 2. Crea un nuovo branch per la proposta
    await octokit.git.createRef({
      owner, 
      repo,
      ref: `refs/heads/${branchName}`,
      sha: mainBranch.object.sha
    });

    // 3. Crea il file nel nuovo branch
    await octokit.repos.createOrUpdateFileContents({
      owner, 
      repo,
      path: fileName,
      message: `New blog proposal: ${title}`,
      content: Buffer.from(jsonContent).toString('base64'),
      branch: branchName
    });

    // 4. Apri la Pull Request
    const { data: pr } = await octokit.pulls.create({
      owner, 
      repo,
      title: `📝 Blog Proposal: ${title}`,
      head: branchName,
      base: 'main',
      body: `Nuova proposta di blog inviata tramite l'editor del sito.\n\nTitolo: ${title}`
    });

    return NextResponse.json({ success: true, url: pr.html_url });

  } catch (error: any) {
    console.error("GitHub API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Gestione pre-flight CORS per chiamate da github.io
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://physicshub.github.io',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}