import type { Contributor } from '../contributors/models/contributor';

export const getPercentagesContributor = (contributors: Contributor[], c: Contributor) => {
    const totalContributions = contributors.reduce((acc, curr) => acc + curr.contributions, 0);
    const percentage = (c.contributions / totalContributions) * 100;
    return `${percentage.toFixed(2)}%`;
}