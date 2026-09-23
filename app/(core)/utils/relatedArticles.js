// Recommends articles for a simulation page. Ranking is deliberately simple and
// explainable, highest weight first:
//   1. the simulation's own article (`relatedBlogSlug`);
//   2. a distinctive word of the simulation's name in the article's title
//      ("Double Pendulum" → every pendulum article);
//   3. shared topic tags, weighted by rarity — sharing "Oscillations" says more
//      than sharing "Dynamics", which half the catalogue carries;
//   4. school-level fit, then newest first.
// Articles with no name word and no topic in common are never suggested.

import { getSimulationFacets, getBlogFacets } from "./catalogFilters.js";

// Every article carries it, so sharing it says nothing about relatedness.
const GENERIC_TOPICS = new Set(["Physics"]);

// Words in simulation names that describe the format, not the subject.
const NAME_STOPWORDS = new Set([
  "simulation",
  "simulator",
  "system",
  "simple",
  "calculator",
  "problem",
  "from",
  "with",
  "test",
]);

// Articles carry DD/MM/YYYY; anything unparsable sorts as oldest.
const dateValue = (date) => {
  const [d, m, y] = String(date || "").split("/");
  const value = Date.UTC(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(value) ? 0 : value;
};

const words = (text) =>
  String(text || "")
    .toLowerCase()
    .match(/[a-z]{4,}/g) || [];

/**
 * @param {{ name: string, tags?: {name: string}[], level?: string,
 *           alsoFor?: string[], relatedBlogSlug?: string }} chapter
 *        catalogue entry of the simulation
 * @param {{ slug: string, name: string, tags: object[], date?: string }[]} blogs
 * @param {number} [limit]
 */
export function getRelatedArticles(chapter, blogs, limit = 3) {
  const sim = getSimulationFacets(chapter);
  const simTopics = new Set(sim.topics.filter((t) => !GENERIC_TOPICS.has(t)));
  const nameWords = words(chapter.name).filter((w) => !NAME_STOPWORDS.has(w));

  const blogFacets = blogs.map(getBlogFacets);
  const topicCount = {};
  for (const { topics } of blogFacets)
    for (const topic of topics)
      topicCount[topic] = (topicCount[topic] || 0) + 1;
  const rarity = (topic) => Math.log(1 + blogs.length / topicCount[topic]);

  return blogs
    .map((blog, index) => {
      const facets = blogFacets[index];
      const title =
        `${blog.slug.replaceAll("-", " ")} ${blog.name}`.toLowerCase();
      const isOwn = blog.slug === chapter.relatedBlogSlug;
      const nameHits = nameWords.filter((w) => title.includes(w)).length;
      const sharedTopics = facets.topics.filter((t) => simTopics.has(t));
      const levelFit = facets.levels.some((id) => sim.levels.includes(id));
      return {
        blog,
        index,
        eligible: isOwn || nameHits > 0 || sharedTopics.length > 0,
        score:
          (isOwn ? 1000 : 0) +
          nameHits * 20 +
          sharedTopics.reduce((sum, t) => sum + rarity(t), 0) * 5 +
          (levelFit ? 1 : 0),
      };
    })
    .filter((entry) => entry.eligible)
    .sort(
      (a, b) =>
        b.score - a.score ||
        dateValue(b.blog.date) - dateValue(a.blog.date) ||
        a.index - b.index
    )
    .slice(0, limit)
    .map((entry) => entry.blog);
}
