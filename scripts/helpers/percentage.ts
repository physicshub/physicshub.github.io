// scripts/helpers/percentage.ts
import type { Contributor } from "../contributors/models/contributor";

/**
 * Percentuale dei commits di un contributor rispetto al totale.
 */
export const getPercentagesCommits = (
  contributors: Contributor[],
  c: Contributor
) => {
  const totalContributions = contributors.reduce(
    (acc, curr) => acc + curr.contributions,
    0
  );
  if (totalContributions === 0) return "0%";
  const percentage = (c.contributions / totalContributions) * 100;
  return `${percentage.toFixed(2)}%`;
};

/**
 * Percentuale delle additions di un contributor rispetto al totale.
 */
export const getPercentagesAdditions = (
  contributorsStats: { login: string; additions: number }[],
  cLogin: string
) => {
  const totalAdditions = contributorsStats.reduce(
    (acc, curr) => acc + curr.additions,
    0
  );
  if (totalAdditions === 0) return "0%";
  const contributor = contributorsStats.find((cs) => cs.login === cLogin);
  const percentage = ((contributor?.additions ?? 0) / totalAdditions) * 100;
  return `${percentage.toFixed(2)}%`;
};

/**
 * Percentuale delle deletions di un contributor rispetto al totale.
 */
export const getPercentagesDeletions = (
  contributorsStats: { login: string; deletions: number }[],
  cLogin: string
) => {
  const totalDeletions = contributorsStats.reduce(
    (acc, curr) => acc + curr.deletions,
    0
  );
  if (totalDeletions === 0) return "0%";
  const contributor = contributorsStats.find((cs) => cs.login === cLogin);
  const percentage = ((contributor?.deletions ?? 0) / totalDeletions) * 100;
  return `${percentage.toFixed(2)}%`;
};
