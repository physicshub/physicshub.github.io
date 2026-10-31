// School curricula. `LEVELS` in tags.js is an age-based, international scale;
// every country cuts school differently (GCSE vs A-Level, Class 9 vs Class 11,
// Sec 3 vs JC1…), so the same concept lands on a different stage of a
// different name. A curriculum here is an ordered list of *stages* — the
// vocabulary a student or teacher in that country actually uses — and
// getPlacement() answers "where does this item sit in that curriculum?".
//
// `intl` is the default and the fallback: it reuses the LEVELS scale, so an
// unrecognised country (or a first paint before detection) shows exactly what
// the site showed before curricula existed.
//
// The per-concept assignments live in curriculumTopics.js. Anything without an
// entry falls back to its international level, mapped onto the curriculum's
// stages through each stage's `band`.

import { LEVELS, LEVEL_ORDER } from "./tags.js";
import { CONTENT_TOPICS, TOPIC_PLACEMENTS } from "./curriculumTopics.js";

export const DEFAULT_CURRICULUM = "intl";

// Every curriculum ends with the same non-curricular stage, so the benchmark
// page (and any future demo) has a home everywhere.
const TOOL_STAGE = {
  id: "tool",
  name: LEVELS.tool.name,
  grades: null,
  age: LEVELS.tool.age,
  color: LEVELS.tool.color,
  band: "tool",
};

const stage = (id, name, grades, age, color, band) => ({
  id,
  name,
  grades,
  age,
  color,
  band,
});

export const CURRICULA = {
  intl: {
    id: "intl",
    name: "International",
    code: "INT",
    framework: "Age-based scale (K-12 equivalents)",
    // Same objects as LEVELS, so ids, names and colours are untouched.
    stages: LEVEL_ORDER.map((level) => ({
      ...level,
      grades: null,
      band: level.id,
    })),
  },

  us: {
    id: "us",
    name: "United States",
    code: "US",
    framework: "NGSS · Common Core · AP",
    stages: [
      stage(
        "elementary",
        "Elementary School",
        "Grades K–5",
        "Ages 5–11",
        "green",
        "elementary"
      ),
      stage(
        "middle",
        "Middle School",
        "Grades 6–8",
        "Ages 11–14",
        "teal",
        "lowerSecondary"
      ),
      stage(
        "high",
        "High School",
        "Grades 9–12",
        "Ages 14–18",
        "bluesky",
        "upperSecondary"
      ),
      stage(
        "college",
        "College / University",
        "Undergraduate",
        "Ages 18+",
        "purple",
        "undergraduate"
      ),
      TOOL_STAGE,
    ],
  },

  uk: {
    id: "uk",
    name: "United Kingdom",
    code: "UK",
    framework: "National Curriculum (England) · GCSE · A-Level",
    stages: [
      stage(
        "primary",
        "Primary (KS1–2)",
        "Years 1–6",
        "Ages 5–11",
        "green",
        "elementary"
      ),
      stage(
        "ks3",
        "Key Stage 3",
        "Years 7–9",
        "Ages 11–14",
        "teal",
        "lowerSecondary"
      ),
      stage(
        "gcse",
        "GCSE (KS4)",
        "Years 10–11",
        "Ages 14–16",
        "bluesky",
        "upperSecondary"
      ),
      stage(
        "alevel",
        "A-Level (KS5)",
        "Years 12–13",
        "Ages 16–18",
        "indigo",
        "upperSecondary"
      ),
      stage(
        "university",
        "University",
        "Undergraduate",
        "Ages 18+",
        "purple",
        "undergraduate"
      ),
      TOOL_STAGE,
    ],
  },

  in: {
    id: "in",
    name: "India",
    code: "IN",
    framework: "NCERT · CBSE",
    stages: [
      stage(
        "primary",
        "Primary",
        "Classes 1–5",
        "Ages 6–11",
        "green",
        "elementary"
      ),
      stage(
        "middle",
        "Middle School",
        "Classes 6–8",
        "Ages 11–14",
        "teal",
        "lowerSecondary"
      ),
      stage(
        "secondary",
        "Secondary",
        "Classes 9–10",
        "Ages 14–16",
        "bluesky",
        "upperSecondary"
      ),
      stage(
        "senior",
        "Senior Secondary",
        "Classes 11–12",
        "Ages 16–18",
        "indigo",
        "upperSecondary"
      ),
      stage(
        "university",
        "Undergraduate",
        "B.Sc / B.Tech",
        "Ages 18+",
        "purple",
        "undergraduate"
      ),
      TOOL_STAGE,
    ],
  },

  au: {
    id: "au",
    name: "Australia",
    code: "AU",
    framework: "Australian Curriculum v9 · state senior courses",
    stages: [
      stage(
        "primary",
        "Primary",
        "Foundation–Year 6",
        "Ages 5–12",
        "green",
        "elementary"
      ),
      stage(
        "junior",
        "Junior Secondary",
        "Years 7–10",
        "Ages 12–16",
        "teal",
        "lowerSecondary"
      ),
      stage(
        "senior",
        "Senior Secondary",
        "Years 11–12",
        "Ages 16–18",
        "bluesky",
        "upperSecondary"
      ),
      stage(
        "university",
        "University",
        "Undergraduate",
        "Ages 18+",
        "purple",
        "undergraduate"
      ),
      TOOL_STAGE,
    ],
  },

  it: {
    id: "it",
    name: "Italy",
    code: "IT",
    framework: "Indicazioni nazionali · Licei",
    stages: [
      stage(
        "primaria",
        "Scuola primaria",
        "Classi 1–5",
        "Ages 6–11",
        "green",
        "elementary"
      ),
      stage(
        "media",
        "Scuola secondaria di I grado",
        "Medie · Classi 1–3",
        "Ages 11–14",
        "teal",
        "lowerSecondary"
      ),
      stage(
        "biennio",
        "Superiori · Biennio",
        "1º–2º anno",
        "Ages 14–16",
        "bluesky",
        "upperSecondary"
      ),
      stage(
        "triennio",
        "Superiori · Triennio",
        "3º–5º anno",
        "Ages 16–19",
        "indigo",
        "upperSecondary"
      ),
      stage(
        "universita",
        "Università",
        "Laurea",
        "Ages 19+",
        "purple",
        "undergraduate"
      ),
      TOOL_STAGE,
    ],
  },

  sg: {
    id: "sg",
    name: "Singapore",
    code: "SG",
    framework: "MOE · SEAB O-Level / A-Level",
    stages: [
      stage("primary", "Primary", "P1–P6", "Ages 7–12", "green", "elementary"),
      stage(
        "lower",
        "Lower Secondary",
        "Sec 1–2",
        "Ages 13–14",
        "teal",
        "lowerSecondary"
      ),
      stage(
        "upper",
        "Upper Secondary · O-Level",
        "Sec 3–4/5",
        "Ages 15–16",
        "bluesky",
        "upperSecondary"
      ),
      stage(
        "jc",
        "Junior College · A-Level",
        "JC1–2",
        "Ages 17–18",
        "indigo",
        "upperSecondary"
      ),
      stage(
        "university",
        "University",
        "Undergraduate",
        "Ages 18+",
        "purple",
        "undergraduate"
      ),
      TOOL_STAGE,
    ],
  },
};

// Order shown in the selector: the default first, then by reader population.
export const CURRICULUM_ORDER = ["intl", "us", "uk", "in", "au", "it", "sg"];

export const getCurriculum = (id) =>
  CURRICULA[id] || CURRICULA[DEFAULT_CURRICULUM];

export const getStages = (curriculumId) => getCurriculum(curriculumId).stages;

export const getStage = (curriculumId, stageId) =>
  getStages(curriculumId).find((s) => s.id === stageId) || null;

// ─── Items ───────────────────────────────────────────────────────────────────
// Simulations (chapters.js entries) and articles are both "items"; the key
// below is what curriculumTopics.js indexes them by.

export const getContentKey = (item) => {
  if (!item) return null;
  if (item.slug) return `blog:${item.slug}`;
  const match = /\/simulations\/([^/?#]+)/.exec(item.link || "");
  return match ? `sim:${match[1]}` : null;
};

// The international level of an item: explicit fields on a simulation, the
// LEVELS objects folded into `tags` on an article.
export const getUniversalLevels = (item) => {
  if (!item) return { primary: null, also: [] };
  if (item.level) return { primary: item.level, also: item.alsoFor || [] };
  const ids = (item.tags || [])
    .filter((tag) => tag?.id && LEVELS[tag.id])
    .map((tag) => tag.id);
  return { primary: ids[0] || null, also: ids.slice(1) };
};

const stagesOfBand = (curriculum, band) =>
  curriculum.stages.filter((s) => s.band === band);

const unique = (list) => [...new Set(list)];

// Where an item sits in a curriculum. Returns null when it has no level, else
//   { curriculumId, stageId, stage, alsoIds, alsoStages, grades, note,
//     approximate }
// `approximate` is true when the item has no entry in curriculumTopics.js and
// the answer was derived from its international level.
export const getPlacement = (item, curriculumId = DEFAULT_CURRICULUM) => {
  const curriculum = getCurriculum(curriculumId);
  const universal = getUniversalLevels(item);

  const build = (stageId, alsoIds, extra) => {
    const primaryStage = getStage(curriculum.id, stageId);
    if (!primaryStage) return null;
    const alsoStagesList = unique(alsoIds)
      .filter((id) => id !== stageId)
      .map((id) => getStage(curriculum.id, id))
      .filter(Boolean);
    return {
      curriculumId: curriculum.id,
      stageId,
      stage: primaryStage,
      alsoIds: alsoStagesList.map((s) => s.id),
      alsoStages: alsoStagesList,
      grades: extra.grades || primaryStage.grades || null,
      note: extra.note || null,
      approximate: Boolean(extra.approximate),
    };
  };

  if (curriculum.id !== DEFAULT_CURRICULUM) {
    const topic = CONTENT_TOPICS[getContentKey(item)];
    const placement = topic && TOPIC_PLACEMENTS[topic]?.[curriculum.id];
    if (placement) {
      const placed = build(placement.stage, placement.also, placement);
      if (placed) return placed;
    }
  }

  if (!universal.primary) return null;

  // International level, or the fallback for an item without a topic: map each
  // band onto the curriculum's stages. A band that a curriculum splits in two
  // (GCSE + A-Level) keeps both, the first as primary.
  const primaryStages = stagesOfBand(curriculum, universal.primary);
  if (primaryStages.length === 0) return null;
  const alsoIds = [
    ...primaryStages.slice(1).map((s) => s.id),
    ...universal.also.flatMap((band) =>
      stagesOfBand(curriculum, band).map((s) => s.id)
    ),
  ];
  return build(primaryStages[0].id, alsoIds, {
    approximate: curriculum.id !== DEFAULT_CURRICULUM,
  });
};

// Stage ids an item belongs to (primary first) — what the level filter matches.
export const getStageIds = (item, curriculumId) => {
  const placement = getPlacement(item, curriculumId);
  return placement ? [placement.stageId, ...placement.alsoIds] : [];
};

// One line of context for tooltips: where, which age, what else it suits.
export const describePlacement = (placement, translate = (s) => s) => {
  if (!placement) return "";
  const { stage: s, curriculumId, grades, alsoStages, note } = placement;
  const curriculum = getCurriculum(curriculumId);
  const parts =
    curriculumId === DEFAULT_CURRICULUM
      ? [
          translate(s.age),
          ...(s.equivalents || []),
          ...(alsoStages.length
            ? [
                `${translate("Also suitable for")}: ${alsoStages
                  .map((a) => translate(a.name))
                  .join(", ")}`,
              ]
            : []),
        ]
      : [
          translate(curriculum.name),
          grades,
          translate(s.age),
          ...(alsoStages.length
            ? [
                `${translate("Also suitable for")}: ${alsoStages
                  .map((a) => translate(a.name))
                  .join(", ")}`,
              ]
            : []),
          note ? translate(note) : null,
        ];
  return parts.filter(Boolean).join(" · ");
};

// Articles carry their level as a tag. Swap it for the reader's stage so cards
// and headers say "A-Level (KS5)" instead of "High School"; any extra level
// tags are dropped (they are international bands, meaningless here).
export const localizeTags = (tags, item, curriculumId) => {
  if (!tags || curriculumId === DEFAULT_CURRICULUM) return tags;
  const placement = getPlacement(item, curriculumId);
  if (!placement) return tags;

  let replaced = false;
  const result = [];
  for (const tag of tags) {
    if (tag?.id && LEVELS[tag.id]) {
      if (!replaced) {
        replaced = true;
        result.push({
          id: `${curriculumId}-${placement.stageId}`,
          name: placement.stage.name,
          color: placement.stage.color,
        });
      }
      continue;
    }
    result.push(tag);
  }
  return result;
};
