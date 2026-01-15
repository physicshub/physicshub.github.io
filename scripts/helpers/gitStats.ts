// scripts/helpers/gitStats.ts
import axios from "axios";
import { green, red, yellow } from "../helpers/painter.ts";

export interface ContributorStats {
  additions: number | null;
  deletions: number | null;
  commits: number | null;
}

/**
 * Poll GitHub API until stats are ready.
 * @param author GitHub username
 * @param maxRetries Numero massimo di tentativi
 * @param delayMs Millisecondi di attesa tra i retry
 */
export const getRemoteStats = async (
  author: string,
  maxRetries = 10,
  delayMs = 5000
): Promise<ContributorStats> => {
  if (!process.env.GH_TOKEN) {
    console.log(red("GH_TOKEN isn't defined. Define it on .env file"));
    return { additions: null, deletions: null, commits: null };
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await axios.get(
        `https://api.github.com/repos/physicshub/physicshub.github.io/stats/contributors`,
        {
          headers: {
            accept: "application/json",
            "User-Agent": "Contributors script",
            ...(process.env.GH_TOKEN
              ? { Authorization: `token ${process.env.GH_TOKEN}` }
              : {}),
          },
        }
      );

      const contributors = res.data;

      // Se la risposta non è ancora pronta (202 Accepted)
      if (!Array.isArray(contributors)) {
        console.warn(
          yellow(
            `Stats not ready yet for ${author}. Attempt ${attempt}/${maxRetries}`
          )
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      const contributor = contributors.find(
        (c: any) => c.author?.login?.toLowerCase() === author.toLowerCase()
      );

      if (!contributor) {
        console.warn(yellow(`No stats found for ${author}.`));
        return { additions: 0, deletions: 0, commits: 0 };
      }

      let additions = 0;
      let deletions = 0;
      let commits = 0;

      contributor.weeks.forEach((week: any) => {
        additions += week.a;
        deletions += week.d;
        commits += week.c;
      });

      console.log(green(`Stats found for ${author}.`));
      return { additions, deletions, commits };
    } catch (err) {
      console.error(
        red(
          `Error fetching stats for ${author}. Attempt ${attempt}/${maxRetries}`
        )
      );
      // aspetta e riprova invece di uscire subito
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // se dopo maxRetries non sono pronti
  console.warn(
    red(`Stats not available for ${author} after ${maxRetries} attempts.`)
  );
  return { additions: null, deletions: null, commits: null };
};
