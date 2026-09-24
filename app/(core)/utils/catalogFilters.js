// Shared filter + sort logic for the two catalogue surfaces (the /simulations
// index and the /blog index). Both render the same <Search> bar and must agree
// on how a "School level", "Difficulty" or "Topic" selection narrows a list and
// how a sort reorders it — this module is that single source of truth.

import { LEVELS, DIFFICULTIES } from "../data/tags.js";
import {
  DEFAULT_CURRICULUM,
  getStageIds,
  getStages,
} from "../data/curricula.js";

// ─── Facets ──────────────────────────────────────────────────────────────────
// Normalise a catalogue item to the three filterable axes. Simulations carry
// them as explicit fields; blogs fold level/difficulty/topic into one `tags`
// array of the very objects exported from tags.js, so we classify by identity.
//
// `levels` are stage ids of the given curriculum (see data/curricula.js), so
// "School level" filters by the reader's own school system. With the default
// `intl` curriculum they are the international LEVELS ids, as before.

export const getSimulationFacets = (
  chap,
  curriculumId = DEFAULT_CURRICULUM
) => ({
  levels: getStageIds(chap, curriculumId),
  difficulties: chap.difficulty ? [chap.difficulty] : [],
  topics: (chap.tags || []).map((tag) => tag.name),
});

export const getBlogFacets = (blog, curriculumId = DEFAULT_CURRICULUM) => {
  const difficulties = [];
  const topics = [];

  for (const tag of blog.tags || []) {
    if (tag?.id && LEVELS[tag.id]) continue;
    if (tag?.id && DIFFICULTIES[tag.id]) difficulties.push(tag.id);
    else if (tag?.name) topics.push(tag.name);
  }

  return { levels: getStageIds(blog, curriculumId), difficulties, topics };
};

// ─── Matching ────────────────────────────────────────────────────────────────
// Level and difficulty are OR within their group (picking two levels widens the
// result); topics are AND (picking two topics asks for items covering both),
// matching the behaviour the simulations index already shipped.

export const facetMatches = (facets, filter) => {
  const levelOk =
    !filter.levels?.length ||
    filter.levels.some((id) => facets.levels.includes(id));

  const difficultyOk =
    !filter.difficulties?.length ||
    filter.difficulties.some((id) => facets.difficulties.includes(id));

  const topicOk =
    !filter.tags?.length ||
    filter.tags.every((name) => facets.topics.includes(name));

  return levelOk && difficultyOk && topicOk;
};

export const hasActiveFacets = (filter) =>
  Boolean(
    filter?.text?.trim() ||
    filter?.tags?.length ||
    filter?.levels?.length ||
    filter?.difficulties?.length
  );

// ─── Sorting ─────────────────────────────────────────────────────────────────

// Position of each stage of a curriculum, youngest first.
const stageIndex = (curriculumId) =>
  getStages(curriculumId).reduce((acc, stage, i) => {
    acc[stage.id] = i;
    return acc;
  }, {});

// Articles store their date as "DD/MM/YYYY"; community drafts may have none.
export const parseCatalogDate = (value) => {
  const match = String(value ?? "")
    .trim()
    .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  const time = new Date(Number(y), Number(m) - 1, Number(d)).getTime();
  return Number.isNaN(time) ? null : time;
};

export const DEFAULT_SORT = "recommended";

// `needs` lets a surface hide a sort it can't honour (e.g. a list with no dates
// still can, we just fall back to the recommended order for those items).
export const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended", hint: "Our curated order" },
  { id: "name-asc", label: "Name: A to Z" },
  { id: "name-desc", label: "Name: Z to A" },
  { id: "level-asc", label: "Level: intro first" },
  { id: "level-desc", label: "Level: advanced first" },
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
];

const primaryLevelIndex = (facets, index) => {
  const indices = facets.levels
    .map((id) => index[id])
    .filter((n) => n !== undefined);
  return indices.length ? Math.min(...indices) : Number.MAX_SAFE_INTEGER;
};

/**
 * Return a new, sorted array. `ctx` supplies the per-surface accessors:
 *   getFacets(item)   → { levels, difficulties, topics }  (for level sort)
 *   getName(item)     → string                            (for name sort)
 *   getRecency(item)  → number | null                     (for date/newest sort)
 *   curriculumId      → whose stage order the level sort follows (default intl)
 * The original order is preserved as the stable tie-breaker, so "recommended"
 * is a genuine no-op and every other sort stays deterministic.
 */
export const sortCatalog = (items, sortId, ctx = {}) => {
  const getName = ctx.getName || ((item) => item.name || "");
  const getFacets = ctx.getFacets || (() => ({ levels: [] }));
  const getRecency = ctx.getRecency || (() => null);
  const index = stageIndex(ctx.curriculumId || DEFAULT_CURRICULUM);

  const decorated = items.map((item, index) => ({ item, index }));

  const byIndex = (a, b) => a.index - b.index;
  const name = (x) => getName(x.item);
  const recency = (x) => {
    const value = getRecency(x.item);
    return value === null || value === undefined ? -Infinity : value;
  };

  const comparators = {
    recommended: byIndex,
    "name-asc": (a, b) =>
      name(a).localeCompare(name(b), undefined, { sensitivity: "base" }) ||
      byIndex(a, b),
    "name-desc": (a, b) =>
      name(b).localeCompare(name(a), undefined, { sensitivity: "base" }) ||
      byIndex(a, b),
    "level-asc": (a, b) =>
      primaryLevelIndex(getFacets(a.item), index) -
        primaryLevelIndex(getFacets(b.item), index) || byIndex(a, b),
    "level-desc": (a, b) =>
      primaryLevelIndex(getFacets(b.item), index) -
        primaryLevelIndex(getFacets(a.item), index) || byIndex(a, b),
    newest: (a, b) => recency(b) - recency(a) || byIndex(a, b),
    oldest: (a, b) => recency(a) - recency(b) || byIndex(a, b),
  };

  const comparator = comparators[sortId] || byIndex;
  decorated.sort(comparator);
  return decorated.map((x) => x.item);
};
