// scripts/helpers/gitStats.ts
import axios from "axios";
import { green, red, yellow } from "../helpers/painter.ts";

export interface ContributorStats {
  additions: number;
  deletions: number;
  commits: number;
}

export interface AggregatedContributorStats {
  [login: string]: ContributorStats;
}

interface GitHubCommit {
  sha: string;
  author: {
    login: string;
  } | null;
}

interface ParentCommit {
  sha: string;
}
interface GitHubCommitDetails {
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
  author: {
    login: string;
  } | null;
  parents: ParentCommit[];
}

let cachedStats: AggregatedContributorStats | null = null;

/**
 * Fetch all contributor stats using commit aggregation
 */
export const fetchAllStats = async (): Promise<AggregatedContributorStats> => {
  if (!process.env.GH_TOKEN) {
    console.log(red("GH_TOKEN isn't defined. Define it in your .env file."));
    return {};
  }

  // Use cache
  if (cachedStats) {
    console.log(green("Using cached contributor stats"));
    return cachedStats;
  }

  const repository = "physicshub/physicshub.github.io";

  console.log(
    green(`Fetching contributor stats from repository: ${repository}`)
  );

  const aggregatedStats: AggregatedContributorStats = {};

  try {
    let page = 1;
    let hasMore = true;
    let totalCommitsProcessed = 0;

    while (hasMore) {
      console.log(yellow(`Fetching commits page ${page}...`));

      const commitsResponse = await axios.get(
        `https://api.github.com/repos/${repository}/commits`,
        {
          params: {
            per_page: 100,
            page,
          },
          headers: {
            accept: "application/json",
            "User-Agent": "Contributors script",
            Authorization: `Bearer ${process.env.GH_TOKEN}`,
          },
        }
      );

      const commits: GitHubCommit[] = commitsResponse.data;

      console.log(green(`Fetched ${commits.length} commits from page ${page}`));

      // Stop pagination
      if (!commits.length) {
        hasMore = false;
        break;
      }

      // Chunk processing
      const chunkSize = 5;

      for (let i = 0; i < commits.length; i += chunkSize) {
        const chunk = commits.slice(i, i + chunkSize);

        console.log(
          yellow(
            `Processing commits ${i + 1} - ${Math.min(
              i + chunkSize,
              commits.length
            )} from page ${page}`
          )
        );

        await Promise.all(
          chunk.map(async (commit) => {
            if (!commit.author?.login) {
              return;
            }

            try {
              const commitDetailsResponse = await axios.get(
                `https://api.github.com/repos/${repository}/commits/${commit.sha}`,
                {
                  headers: {
                    accept: "application/json",
                    "User-Agent": "Contributors script",
                    Authorization: `Bearer ${process.env.GH_TOKEN}`,
                  },
                }
              );
              const commitDetails: GitHubCommitDetails =
                commitDetailsResponse.data;

              // Skip merge commits
              if (commitDetails.parents.length > 1) {
                return;
              }
              const login = commit.author.login.toLowerCase();

              if (!aggregatedStats[login]) {
                aggregatedStats[login] = {
                  additions: 0,
                  deletions: 0,
                  commits: 0,
                };

                console.log(green(`New contributor detected: ${login}`));
              }

              aggregatedStats[login].commits += 1;

              aggregatedStats[login].additions +=
                commitDetails.stats?.additions ?? 0;

              aggregatedStats[login].deletions +=
                commitDetails.stats?.deletions ?? 0;

              totalCommitsProcessed += 1;
            } catch (error: unknown) {
              const message =
                error instanceof Error ? error.message : String(error);
              console.warn(
                yellow(
                  `Failed to fetch commit details for ${commit.sha}: ${message}`
                )
              );
            }
          })
        );
      }

      console.log(
        green(
          `Completed processing page ${page}. Total processed commits: ${totalCommitsProcessed}`
        )
      );

      page += 1;
    }

    console.log(
      green(
        `Successfully aggregated stats for ${
          Object.keys(aggregatedStats).length
        } contributors`
      )
    );
    console.log("\n=== Aggregated Contributors ===\n");
    Object.keys(aggregatedStats)
      .sort()
      .forEach((login, index) => {
        console.log(`${index + 1}. ${login}`);
      });
    console.log(
      `\nTotal aggregated contributors: ${Object.keys(aggregatedStats).length}`
    );
    console.log("\nTop contributors stats:\n");

    Object.entries(aggregatedStats)
      .sort((a, b) => b[1].additions - a[1].additions)
      .slice(0, 20)
      .forEach(([login, stats], index) => {
        console.log(
          `${index + 1}. ${login}
       commits: ${stats.commits}
       additions: ${stats.additions}
       deletions: ${stats.deletions}\n`
        );
      });

    cachedStats = aggregatedStats;

    return aggregatedStats;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(red(`Failed to fetch contributor stats: ${message}`));

    return {};
  }
};

// Get stats for a specific contributor

export const getStatsForAuthor = (
  stats: AggregatedContributorStats,
  login: string
): ContributorStats => {
  const contributorStats = stats[login.toLowerCase()];

  if (!contributorStats) {
    console.warn(yellow(`No aggregated stats found for ${login}`));

    return {
      additions: 0,
      deletions: 0,
      commits: 0,
    };
  }

  return contributorStats;
};
