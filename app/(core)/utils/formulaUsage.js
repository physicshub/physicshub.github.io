// Where each Formulary card is used, derived from the references themselves so
// it can never drift from the content: a simulation lists ids in its
// `simulationOverviews.js` entry, an article uses `{ type: "formula", ref }`
// blocks or an inline `[[id]]` in its prose.
//
// Server-side and build-time only (it imports every article): the /formulas
// page computes the usage here and hands the client plain data.

import { formulas, formulaById } from "../data/formulas/index.js";

const INLINE_REF = /\[\[([a-z0-9-]+)\]\]/g;

const getSimId = (link = "") =>
  link.split("/simulations/")[1]?.split(/[?#]/)[0] || "";

const overviewRefs = (overview) =>
  (overview?.formulas || []).map((entry) =>
    typeof entry === "string" ? entry : entry?.ref
  );

// Every ref an article makes: block refs, plus inline [[id]] anywhere in its
// prose (paragraphs, lists, tables, callouts…), found in the serialised theory.
export const articleRefs = (article) => {
  const refs = [];
  for (const section of article.theory?.sections || []) {
    for (const block of section.blocks || []) {
      if (block.type === "formula" && block.ref) refs.push(block.ref);
    }
  }
  const text = JSON.stringify(article.theory || {});
  for (const match of text.matchAll(INLINE_REF)) refs.push(match[1]);
  return refs;
};

/**
 * @returns {Record<string, { simulations: { name: string, href: string }[],
 *   articles: { name: string, href: string }[] }>}
 */
export const buildFormulaUsage = ({ chapters, overviews, articles }) => {
  const usage = Object.fromEntries(
    formulas.map((f) => [f.id, { simulations: [], articles: [] }])
  );

  for (const chapter of chapters) {
    const refs = new Set(overviewRefs(overviews[getSimId(chapter.link)]));
    for (const id of refs) {
      usage[id]?.simulations.push({ name: chapter.name, href: chapter.link });
    }
  }

  for (const article of articles) {
    for (const id of new Set(articleRefs(article))) {
      usage[id]?.articles.push({
        name: article.name,
        href: `/blog/${article.slug}`,
      });
    }
  }

  return usage;
};

/**
 * Every problem in the registry and in the refs to it, as readable strings.
 * scripts/generate-feeds.js fails the build when this is non-empty.
 */
export const validateFormulas = ({ overviews, articles }) => {
  const errors = [];
  const seen = new Set();

  for (const f of formulas) {
    if (seen.has(f.id)) errors.push(`duplicate formula id "${f.id}"`);
    seen.add(f.id);

    for (const field of ["name", "latex", "summary", "level", "difficulty"]) {
      if (!f[field]) errors.push(`${f.id}: missing "${field}"`);
    }

    const keys = new Set((f.variables || []).map((v) => v.key));
    for (const id of f.related || []) {
      if (!formulaById[id]) errors.push(`${f.id}: unknown related "${id}"`);
    }
    for (const [key, solver] of Object.entries(f.solve || {})) {
      if (!keys.has(key))
        errors.push(`${f.id}: solve.${key} is not a variable`);
      for (const input of solver.from || []) {
        if (!keys.has(input)) {
          errors.push(`${f.id}: solve.${key} uses unknown "${input}"`);
        }
      }
    }
  }

  for (const [simId, overview] of Object.entries(overviews)) {
    for (const ref of overviewRefs(overview)) {
      if (!formulaById[ref]) {
        errors.push(`simulationOverviews.${simId}: unknown formula "${ref}"`);
      }
    }
  }

  for (const article of articles) {
    for (const ref of articleRefs(article)) {
      if (!formulaById[ref]) {
        errors.push(`article ${article.slug}: unknown formula "${ref}"`);
      }
    }
  }

  return errors;
};
