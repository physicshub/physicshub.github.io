// Everything in this folder is used to generate the contributors image shown in the README.md,
// good part of the code is from the original repository: https://github.com/material-extensions/vscode-material-icon-theme
// Credits to Philipp Kief and his contributors for the original code.

// scripts/contributors/contributors.ts
import "dotenv/config";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import axios, { type AxiosRequestConfig } from "axios";
import { writeToFile } from "../helpers/writeFile.ts";
import { green, red, yellow } from "../helpers/painter.ts";
import { createScreenshot } from "../helpers/screenshots.ts";
import type { Contributor } from "./models/contributor.ts";
import {
  getPercentagesCommits,
  getPercentagesAdditions,
  getPercentagesDeletions,
} from "../helpers/percentage.ts";
import { getRemoteStats } from "../helpers/gitStats.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type ContributorStats = {
  login: string;
  additions: number;
  deletions: number;
  commits: number;
  originalContributor?: Contributor;
};

/**
 * Parse link header
 * @param linkHeader Link header as string
 * @returns Object that contains the page numbers of `prev`, `next` and `last`.
 */
const parseLinkHeader = (linkHeader: string) => {
  const nextPagePattern = new RegExp(/\bpage=(\d+)>;\srel="next"/);
  const lastPagePattern = new RegExp(/\bpage=(\d+)>;\srel="last"/);
  const prevPagePattern = new RegExp(/\bpage=(\d+)>;\srel="prev"/);

  const nextPage = nextPagePattern.exec(linkHeader) ?? "";
  const lastPage = lastPagePattern.exec(linkHeader) ?? "";
  const prevPage = prevPagePattern.exec(linkHeader) ?? "";

  return { nextPage, lastPage, prevPage };
};

/**
 * Get contributors from GitHub API (commits count only).
 */
const fetchContributors = (
  page: string
): Promise<{ contributorsOfPage: Contributor[]; nextPage: string }> => {
  return new Promise((resolve, reject) => {
    const config: AxiosRequestConfig = {
      method: "get",
      url: `https://api.github.com/repos/physicshub/physicshub.github.io/contributors`,
      params: { page },
      headers: {
        accept: "application/json",
        "User-Agent": "Contributors script",
      },
    };

    axios
      .request(config)
      .then((res) => {
        const { nextPage, lastPage, prevPage } = parseLinkHeader(
          res.headers?.link?.toString() ?? ""
        );
        console.log(
          "> PhysicsHub:",
          yellow(
            `[${page}/${
              lastPage ? lastPage[1] : +prevPage[1] + 1
            }] Loading contributors from GitHub...`
          )
        );

        resolve({ contributorsOfPage: res.data, nextPage: nextPage?.[1] });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * Create contributors list with stats from GitHub API.
 * @param contributors L'elenco dei contributori (già ordinato per additions)
 * @param contributorsStats Le statistiche complete (additions, deletions, commits)
 */
const createContributorsList = async (
  contributors: Contributor[],
  contributorsStats: ContributorStats[]
) => {
  // Le statistiche sono già state raccolte e l'ordinamento è avvenuto in init()

  const listItems = contributors.map((c) => {
    // Trova le statistiche corrispondenti al contributore corrente
    const stats = contributorsStats.find((cs) => cs.login === c.login);

    return `
      <li title="${c.login}">
        <img src="${c.avatar_url}" alt="${c.login}"/>
        <h3>${c.login}</h3>
        <div class="container">
            <div class="item">
              <div class="added">
                <span>+ ${stats?.additions ?? "-"}</span>
              </div>
              <div class="percentage">
                <span>${getPercentagesAdditions(contributorsStats, c.login)}</span>
              </div>
            </div>
            <div class="item">
              <div class="commits">
                <span>${stats?.commits ?? "-"} commits</span>
              </div>
              <div class="percentage">
                <span>${getPercentagesCommits(contributors, c)}</span>
              </div>
            </div>
            <div class="item">
              <div class="removed">
                <span>- ${stats?.deletions ?? "-"}</span>
              </div>
              <div class="percentage">
                <span>${getPercentagesDeletions(contributorsStats, c.login)}</span>
              </div>
            </div>
        </div>
      </li>`;
  });

  const htmlDoctype = "<!DOCTYPE html>";
  const styling = '<link rel="stylesheet" href="contributors.css">';
  const generatedHtml = `${htmlDoctype}
  <html>
    <head>${styling}</head>
    <body><ul>${listItems.join("\n")}</ul></body>
  </html>`;

  const outputPath = join(__dirname, "contributors.html");
  await writeToFile(outputPath, generatedHtml);
  return outputPath;
};

const init = async () => {
  const contributorsList: Contributor[] = [];
  let page = "1";

  // 1. ITERA SULLE PAGINE DI GITHUB API PER RECUPERARE TUTTI I CONTRIBUOTRI
  while (page !== undefined) {
    const result = await fetchContributors(page);
    contributorsList.push(...result.contributorsOfPage);
    page = result.nextPage;
  }

  if (contributorsList.length > 0) {
    console.log(
      "> PhysicsHub:",
      green("Successfully fetched all contributors from GitHub!")
    );
  } else {
    console.log(
      "> PhysicsHub:",
      red("Error: Could not fetch contributors from GitHub!")
    );
    throw Error();
  }

  // 2. RACCOGLI TUTTE LE STATISTICHE REMOTE (ADDITIONS, DELETIONS, COMMITS)
  console.log(
    "> PhysicsHub:",
    yellow("Fetching remote stats for sorting by additions...")
  );
  const contributorsStats: ContributorStats[] = await Promise.all(
    contributorsList.map(async (c) => {
      const stats = await getRemoteStats(c.login);
      return {
        login: c.login,
        additions: stats.additions ?? 0,
        deletions: stats.deletions ?? 0,
        commits: stats.commits ?? 0,
        originalContributor: c, // Mantiene l'oggetto originale
      };
    })
  );

  // 3. ORDINA LE STATISTICHE PER "ADDITIONS" IN ORDINE DISCENDENTE
  contributorsStats.sort((a, b) => b.additions - a.additions);

  // 4. RICOSTRUISCI contributorsList USANDO L'ORDINE DELLE STATISTICHE (PER LE PERCENTUALI)
  const sortedContributorsList: Contributor[] = contributorsStats.map(
    (c) => c.originalContributor as Contributor
  );

  // 5. CREA LA LISTA HTML PASSANDO LA LISTA ORDINATA E LE STATISTICHE COMPLETE
  const outputPath = await createContributorsList(
    sortedContributorsList,
    contributorsStats
  );

  // 6. CREA L'IMMAGINE
  console.log("> PhysicsHub:", yellow("Creating image..."));
  const fileName = "contributors";
  createScreenshot(outputPath, fileName)
    .then(() => {
      console.log(
        "> PhysicsHub:",
        green(`Successfully created ${fileName} image!`)
      );
    })
    .catch((error) => {
      console.log("> PhysicsHub:", red(`Error: ${error}`));
      throw Error(red(`Error while creating ${fileName} image`));
    });
};

init();
