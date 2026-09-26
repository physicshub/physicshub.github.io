"use client";
import { useEffect, useSyncExternalStore } from "react";

// GitHub numbers (stars, contributor count) shared by every component on the
// page. The header badge is mounted on every route, so it is the first to ask;
// the contributors section on /contribute reads the same value to size its
// title and skeleton grid before its own list has loaded (no layout shift).
//
// Same shape as useCurriculum: a tiny external store, no provider. The server
// and the hydration pass see EMPTY; the client then swaps in the last value it
// saved (so a direct visit already knows the count) and refreshes it once.

const REPO_API = "https://api.github.com/repos/physicshub/physicshub.github.io";
const CONTRIBUTORS_API = `${REPO_API}/contributors?per_page=100`;
const STORAGE_KEY = "physicshub-repo-stats";

export interface RepoStats {
  stars: number | null;
  contributors: number | null;
}

const EMPTY: RepoStats = { stars: null, contributors: null };

let state: RepoStats = EMPTY;
let initialised = false;
let requested = false;
const listeners = new Set<() => void>();

const publish = (next: RepoStats) => {
  state = next;
  listeners.forEach((listener) => listener());
};

const readStored = (): RepoStats => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return {
      stars: typeof raw?.stars === "number" ? raw.stars : null,
      contributors:
        typeof raw?.contributors === "number" ? raw.contributors : null,
    };
  } catch {
    return EMPTY;
  }
};

const writeStored = (stats: RepoStats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Storage blocked: the value still applies for this page view.
  }
};

async function load() {
  try {
    const [repoRes, contributorsRes] = await Promise.all([
      fetch(REPO_API),
      fetch(CONTRIBUTORS_API),
    ]);
    const repoData = await repoRes.json();
    const contributorsData = await contributorsRes.json();

    // Keep the last known value for anything the API didn't answer (rate limit).
    const next: RepoStats = {
      stars:
        typeof repoData?.stargazers_count === "number"
          ? repoData.stargazers_count
          : state.stars,
      contributors: Array.isArray(contributorsData)
        ? contributorsData.length
        : state.contributors,
    };
    writeStored(next);
    publish(next);
  } catch {
    // Offline or blocked: keep whatever we already have.
  }
}

const getSnapshot = (): RepoStats => {
  if (!initialised && typeof window !== "undefined") {
    initialised = true;
    state = readStored();
  }
  return state;
};

const getServerSnapshot = (): RepoStats => EMPTY;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export default function useRepoStats(): RepoStats {
  const stats = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (requested) return;
    requested = true;
    load();
  }, []);

  return stats;
}
