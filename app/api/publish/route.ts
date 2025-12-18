import { NextResponse } from 'next/server';
import { Octokit } from "@octokit/rest";

export async function POST(req: Request) {
  const { title, jsonContent } = await req.body.json();
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const owner = "physicshub"; // Il tuo username
  const repo = "physicshub.github.io";
  const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
  const fileName = `content/blogs/${slug}-${Date.now()}.json`;
  const branchName = `blog-proposal-${slug}`;

  try {
    // 1. Prendi il riferimento al branch principale (main)
    const { data: mainBranch } = await octokit.git.getRef({ owner, repo, ref: 'heads/main' });

    // 2. Crea un nuovo branch per la proposta
    await octokit.git.createRef({
      owner, repo,
      ref: `refs/heads/${branchName}`,
      sha: mainBranch.object.sha
    });

    // 3. Crea il file nel nuovo branch
    await octokit.repos.createOrUpdateFileContents({
      owner, repo,
      path: fileName,
      message: `New blog proposal: ${title}`,
      content: Buffer.from(jsonContent).toString('base64'),
      branch: branchName
    });

    // 4. Apri la Pull Request
    const { data: pr } = await octokit.pulls.create({
      owner, repo,
      title: `📝 Blog Proposal: ${title}`,
      head: branchName,
      base: 'main',
      body: `Nuova proposta di blog inviata tramite l'editor del sito.\n\nTitolo: ${title}`
    });

    return NextResponse.json({ success: true, url: pr.html_url });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}