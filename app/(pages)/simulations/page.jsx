"use client";
import { useMemo, useState, useCallback } from "react";
import Chapter from "../../(core)/components/Chapter.jsx";
import Chapters from "../../(core)/data/chapters.js";
import { Search } from "../../(core)/components/Search";
import { DIFFICULTIES } from "../../(core)/data/tags.js";
import { getPlacement } from "../../(core)/data/curricula.js";
import {
  getSimulationFacets,
  facetMatches,
  sortCatalog,
  DEFAULT_SORT,
} from "../../(core)/utils/catalogFilters.js";
import useTranslation from "../../(core)/hooks/useTranslation.ts";
import useCurriculum from "../../(core)/hooks/useCurriculum.ts";

const getChapterTagNames = (tags) => tags.map((tag) => tag.name.toLowerCase());

const emptyFilter = {
  text: "",
  tags: [],
  levels: [],
  difficulties: [],
  sort: DEFAULT_SORT,
};

const textMatches = (chap, text, curriculumId) => {
  const terms = text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 0);

  if (terms.length === 0) return true;

  // Everything a reader might type for a level: the stage name and the precise
  // grade in their own curriculum ("a-level", "year 12", "class 11").
  const placement = getPlacement(chap, curriculumId);
  const levelText = placement
    ? [
        placement.stage.name,
        placement.grades,
        ...placement.alsoStages.map((stage) => stage.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
    : "";
  const difficultyName = (
    DIFFICULTIES[chap.difficulty]?.name || ""
  ).toLowerCase();

  return terms.every((term) => {
    const normalizedTerm = term.replace(/\s+/g, "");

    return (
      chap.name.toLowerCase().includes(term) ||
      getChapterTagNames(chap.tags).includes(term) ||
      levelText.includes(term) ||
      difficultyName.includes(term) ||
      (chap.id && chap.id.toString().includes(term)) ||
      (chap.id &&
        (`chapter${chap.id}`.includes(normalizedTerm) ||
          `ch${chap.id}`.includes(normalizedTerm)))
    );
  });
};

const chapterMatches = (chap, filter, curriculumId, getFacets) =>
  textMatches(chap, filter.text, curriculumId) &&
  facetMatches(getFacets(chap), filter);

export default function Simulations() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const { curriculumId, stages } = useCurriculum();
  const [filter, setFilter] = useState(emptyFilter);

  // Level facets are stage ids of the reader's curriculum.
  const getFacets = useCallback(
    (chap) => getSimulationFacets(chap, curriculumId),
    [curriculumId]
  );

  const filteredChapters = useMemo(() => {
    const matched = Chapters.filter((chap) =>
      chapterMatches(chap, filter, curriculumId, getFacets)
    );
    return sortCatalog(matched, filter.sort, {
      getFacets,
      curriculumId,
      getName: (chap) => chap.name,
      getRecency: (chap) => chap.id,
    });
  }, [filter, curriculumId, getFacets]);

  const hasAnyFilter =
    filter.text.trim() !== "" ||
    filter.tags.length > 0 ||
    filter.levels.length > 0 ||
    filter.difficulties.length > 0;

  // A single selected level with very few matches reads as a broken filter
  // rather than a young library — say so instead of leaving it unexplained.
  const isThinLevelResult =
    filter.levels.length === 1 &&
    filter.tags.length === 0 &&
    filter.difficulties.length === 0 &&
    filteredChapters.length > 0 &&
    filteredChapters.length <= 2;
  const thinLevelName = isThinLevelResult
    ? stages.find((stage) => stage.id === filter.levels[0])?.name
    : null;

  return (
    <div
      className={`simulations-container ${isCompleted ? "notranslate" : ""}`}
    >
      <section className="simulations-content">
        <h1 className="simulations-content__title">
          {t("Interactive Physics Simulations")}
        </h1>
        <Search
          dataset={Chapters}
          getFacets={getFacets}
          onChange={setFilter}
          itemNoun="simulations"
          resultCount={filteredChapters.length}
        />

        {thinLevelName && (
          <p className="simulations-thin-level-note">
            {t("Our library for")} {t(thinLevelName)}{" "}
            {t("is still growing — here's what's available now.")}
          </p>
        )}

        <main className="simulations-page">
          {filteredChapters.map((chap) => (
            <Chapter key={chap.id} {...chap} />
          ))}
        </main>

        {filteredChapters.length === 0 && hasAnyFilter && (
          <p className="simulations-no-results">{t("No simulations found")}</p>
        )}
      </section>
    </div>
  );
}
