// The Formulary: every formula on PhysicsHub as an object with its own
// "identity card", in one registry. Simulations (simulationOverviews.js) and
// articles (`formula` blocks with a `ref`, inline `[[id]]`) point at a card by
// id, and /formulas renders the whole set. Which sims and articles use a card
// is never written here — utils/formulaUsage.js derives it from those refs.
//
// One file per domain; the order of DOMAINS is the order of the page.
// scripts/generate-feeds.js validates the registry and every ref on each build
// (see validateFormulas in utils/formulaUsage.js).

import kinematics from "./kinematics.js";
import dynamics from "./dynamics.js";
import energy from "./energy.js";
import oscillations from "./oscillations.js";
import gravitation from "./gravitation.js";
import fluidsHeat from "./fluids-heat.js";
import electromagnetism from "./electromagnetism.js";
import optics from "./optics.js";
import modern from "./modern.js";
import math from "./math.js";

/**
 * A quantity in a formula.
 * @typedef {object} FormulaVariable
 * @property {string} key       JS identifier, the key used by `solve`
 * @property {string} latex     how the symbol is typeset
 * @property {string} name      plain-English name
 * @property {string} [unit]    SI unit ("" or omitted for dimensionless)
 * @property {number} [value]   a typical value, pre-filled in the calculator
 * @property {number} [constant] a physical constant: fixed, never an input
 * @property {boolean} [angle]  entered and shown in degrees, solved in radians
 * @property {number} [min]     smallest meaningful value (inclusive)
 * @property {number} [max]     largest meaningful value (inclusive)
 */

/**
 * A solver for one variable: a function of the other values (SI, radians), or
 * `{ from, fn }` when it needs only some of them. Return NaN when there is no
 * real solution.
 * @typedef {((v: Record<string, number>) => number)
 *   | { from: string[], fn: (v: Record<string, number>) => number }} Solver
 */

/**
 * @typedef {object} Formula
 * @property {string} id           anchor on /formulas and the ref key — never rename
 * @property {string} name
 * @property {string[]} [aka]      other names people search for
 * @property {string} latex
 * @property {string} summary      one or two sentences; inline syntax allowed
 * @property {FormulaVariable[]} variables
 * @property {string[]} [validity] when the formula holds
 * @property {object[]} tags       objects from data/tags.js
 * @property {string} level        a LEVELS id
 * @property {string} difficulty   a DIFFICULTIES id
 * @property {string[]} [related]  ids of neighbouring formulas
 * @property {Record<string, Solver>} [solve]  omitted = no calculator
 * @property {string} [note]
 * @property {{ problem: string, solution: string }} [example]
 * @property {string[]} [pitfalls]
 * @property {{ who: string, year: string, text?: string }} [history]
 */

export const DOMAINS = [
  { id: "kinematics", name: /* i18n */ "Kinematics", formulas: kinematics },
  { id: "dynamics", name: /* i18n */ "Forces & dynamics", formulas: dynamics },
  { id: "energy", name: /* i18n */ "Energy & momentum", formulas: energy },
  {
    id: "oscillations",
    name: /* i18n */ "Oscillations",
    formulas: oscillations,
  },
  { id: "gravitation", name: /* i18n */ "Gravitation", formulas: gravitation },
  { id: "fluids-heat", name: /* i18n */ "Fluids & heat", formulas: fluidsHeat },
  {
    id: "electromagnetism",
    name: /* i18n */ "Electricity & magnetism",
    formulas: electromagnetism,
  },
  { id: "optics", name: /* i18n */ "Light & optics", formulas: optics },
  { id: "modern", name: /* i18n */ "Modern physics", formulas: modern },
  { id: "math", name: /* i18n */ "Mathematics", formulas: math },
];

/** @type {(Formula & { domain: string })[]} */
export const formulas = DOMAINS.flatMap((domain) =>
  domain.formulas.map((formula) => ({ ...formula, domain: domain.id }))
);

export const formulaById = Object.fromEntries(
  formulas.map((formula) => [formula.id, formula])
);

export const getFormula = (id) => formulaById[id] || null;

export const FORMULARY_PATH = "/formulas";

export const formulaHref = (id) => `${FORMULARY_PATH}#${id}`;

// A simulation overview or an article block points at a card either by id, or
// as `{ ref, label?, latex? }` to show its own form of the formula (the vector
// form, a variant written for that context) while still linking the card.
// Returns null for an unknown id; the build-time validation reports those.
export const resolveFormulaRef = (entry) => {
  const ref = typeof entry === "string" ? entry : entry?.ref;
  const formula = getFormula(ref);
  if (!formula) return null;
  return {
    id: formula.id,
    name: (typeof entry === "object" && entry.label) || formula.name,
    latex: (typeof entry === "object" && entry.latex) || formula.latex,
    formula,
  };
};

// Summaries use the theory inline syntax; schema and llms.txt want plain text.
export const plainText = (text = "") =>
  text
    .replace(/\$([^$]+?)\$/g, "$1")
    .replace(/\*\*([^*]+?)\*\*/g, "$1")
    .replace(/`([^`]+?)`/g, "$1")
    .replace(/\[([^\]]+?)\]\(([^)\s]+?)\)/g, "$1");

export default formulas;
