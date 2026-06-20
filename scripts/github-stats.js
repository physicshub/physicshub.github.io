import fs from "fs";
import path from "path";

const REPO = "physicshub/physicshub.github.io";
const OUT_PATH = "app/(core)/data/githubStats.json";
const CONTRIBUTORS_OUT_PATH = "app/(core)/data/githubContributors.json";

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "PhysicsHub-build",
};

const trimContributor = (contributor) => ({
  id: contributor.id,
  login: contributor.login,
  html_url: contributor.html_url,
  avatar_url: contributor.avatar_url,
  contributions: contributor.contributions,
});

async function fetchAllContributors() {
  let all = [];
  let page = 1;
  let batch = [];

  do {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contributors?per_page=100&page=${page}`,
      { headers }
    );

    if (!res.ok) break;

    batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;

    all = all.concat(batch.map(trimContributor));
    page += 1;
  } while (batch.length === 100);

  return all;
}

async function main() {
  let stars = null;
  let contributors = null;
  let contributorList = null;

  try {
    const [repoRes, fetchedContributors] = await Promise.all([
      fetch(`https://api.github.com/repos/${REPO}`, { headers }),
      fetchAllContributors(),
    ]);

    if (repoRes.ok) {
      const repo = await repoRes.json();
      stars =
        typeof repo.stargazers_count === "number"
          ? repo.stargazers_count
          : null;
    }

    if (fetchedContributors.length > 0) {
      contributorList = fetchedContributors;
      contributors = fetchedContributors.length;
    }
  } catch (error) {
    console.warn("GitHub stats fetch failed at build time:", error.message);
  }

  let existing = { stars: null, contributors: null };
  if (fs.existsSync(OUT_PATH)) {
    existing = JSON.parse(fs.readFileSync(OUT_PATH, "utf8"));
  }

  const data = {
    stars: stars ?? existing.stars,
    contributors: contributors ?? existing.contributors,
    updatedAt: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(data, null, 2)}\n`);
  console.log("Wrote GitHub stats:", data);

  let existingContributors = [];
  if (fs.existsSync(CONTRIBUTORS_OUT_PATH)) {
    const parsed = JSON.parse(fs.readFileSync(CONTRIBUTORS_OUT_PATH, "utf8"));
    existingContributors = Array.isArray(parsed.contributors)
      ? parsed.contributors
      : [];
  }

  const contributorsData = {
    contributors: contributorList ?? existingContributors,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    CONTRIBUTORS_OUT_PATH,
    `${JSON.stringify(contributorsData, null, 2)}\n`
  );
  console.log(
    "Wrote GitHub contributors:",
    contributorsData.contributors.length
  );
}

main();
