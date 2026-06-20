import githubStatsFallback from "../data/githubStats.json";
import githubContributorsFallback from "../data/githubContributors.json";

const REPO_API = "https://api.github.com/repos/physicshub/physicshub.github.io";
const CONTRIBUTORS_API = `${REPO_API}/contributors?per_page=100`;
const FETCH_TIMEOUT_MS = 8000;

const withTimeout = (signal, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  const abort = () => {
    window.clearTimeout(timeoutId);
    controller.abort();
  };

  signal?.addEventListener("abort", abort, { once: true });

  return {
    signal: controller.signal,
    cleanup: () => {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", abort);
    },
  };
};

export const getGithubStatsFallback = () => ({
  stars: githubStatsFallback.stars,
  contributors: githubStatsFallback.contributors,
});

export const getGithubContributorsFallback = () =>
  Array.isArray(githubContributorsFallback.contributors)
    ? githubContributorsFallback.contributors
    : [];

const trimContributor = (contributor) => ({
  id: contributor.id,
  login: contributor.login,
  html_url: contributor.html_url,
  avatar_url: contributor.avatar_url,
  contributions: contributor.contributions,
});

async function fetchContributorsPage(page, signal) {
  const res = await fetch(`${CONTRIBUTORS_API}&page=${page}`, {
    headers: { Accept: "application/vnd.github+json" },
    signal,
  });

  if (!res.ok) return [];

  const data = await res.json();
  return Array.isArray(data) ? data.map(trimContributor) : [];
}

export async function loadGithubContributors(options = {}) {
  const { signal } = options;
  const fallback = getGithubContributorsFallback();
  const { signal: timedSignal, cleanup } = withTimeout(
    signal,
    FETCH_TIMEOUT_MS
  );

  try {
    let all = [];
    let page = 1;
    let batch = [];

    do {
      batch = await fetchContributorsPage(page, timedSignal);
      if (batch.length === 0) break;
      all = all.concat(batch);
      page += 1;
    } while (batch.length === 100);

    return all.length > 0 ? all : fallback;
  } catch {
    return fallback;
  } finally {
    cleanup();
  }
}

export async function loadGithubStats(options = {}) {
  const { signal } = options;
  const fallback = getGithubStatsFallback();
  const { signal: timedSignal, cleanup } = withTimeout(
    signal,
    FETCH_TIMEOUT_MS
  );

  try {
    const [repoRes, contribRes] = await Promise.all([
      fetch(REPO_API, {
        headers: { Accept: "application/vnd.github+json" },
        signal: timedSignal,
      }),
      fetch(CONTRIBUTORS_API, {
        headers: { Accept: "application/vnd.github+json" },
        signal: timedSignal,
      }),
    ]);

    if (!repoRes.ok) return fallback;

    const repoData = await repoRes.json();
    const contribData = contribRes.ok ? await contribRes.json() : [];

    return {
      stars:
        typeof repoData?.stargazers_count === "number"
          ? repoData.stargazers_count
          : fallback.stars,
      contributors: Array.isArray(contribData)
        ? contribData.length
        : fallback.contributors,
    };
  } catch {
    return fallback;
  } finally {
    cleanup();
  }
}
