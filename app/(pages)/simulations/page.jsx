"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import Chapter from "../../(core)/components/Chapter.jsx";
import Chapters from "../../(core)/data/chapters.js";
import { Search } from "../../(core)/components/Search";
import { LEVELS, DIFFICULTIES } from "../../(core)/data/tags.js";
import {
  getSimulationFacets,
  facetMatches,
  sortCatalog,
  DEFAULT_SORT,
} from "../../(core)/utils/catalogFilters.js";
import useTranslation from "../../(core)/hooks/useTranslation.ts";

const getChapterTagNames = (tags) => tags.map((tag) => tag.name.toLowerCase());

const emptyFilter = {
  text: "",
  tags: [],
  levels: [],
  difficulties: [],
  sort: DEFAULT_SORT,
};

const textMatches = (chap, text) => {
  const terms = text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 0);

  if (terms.length === 0) return true;

  const levelIds = [chap.level, ...(chap.alsoFor || [])];
  const levelNames = levelIds
    .map((id) => LEVELS[id]?.name?.toLowerCase())
    .filter(Boolean);
  const difficultyName = (
    DIFFICULTIES[chap.difficulty]?.name || ""
  ).toLowerCase();

  return terms.every((term) => {
    const normalizedTerm = term.replace(/\s+/g, "");

    return (
      chap.name.toLowerCase().includes(term) ||
      getChapterTagNames(chap.tags).includes(term) ||
      levelNames.includes(term) ||
      difficultyName.includes(term) ||
      (chap.id && chap.id.toString().includes(term)) ||
      (chap.id &&
        (`chapter${chap.id}`.includes(normalizedTerm) ||
          `ch${chap.id}`.includes(normalizedTerm)))
    );
  });
};

const chapterMatches = (chap, filter) =>
  textMatches(chap, filter.text) &&
  facetMatches(getSimulationFacets(chap), filter);

export default function Simulations() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const [filter, setFilter] = useState(emptyFilter);
  const [showHero] = useState(() => {
    if (typeof window !== "undefined") {
      // A shared filtered link (see Search's URL sync) should land on the
      // results, not the splash — a link that dumps a visitor at the hero
      // defeats the point of sharing it.
      if (window.location.search.length > 1) return false;
      return !localStorage.getItem("hasVisitedSimulations");
    }
    return true;
  });
  const contentRef = useRef(null);
  const duration = 1200;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleStart = () => {
    localStorage.setItem("hasVisitedSimulations", "true");
    scrollToContent();
  };

  const scrollToContent = () => {
    if (!contentRef.current) return;
    const start = window.scrollY;
    const target = contentRef.current.offsetTop;
    const distance = target - start;
    let startTime = null;

    const animateScroll = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, start + distance * ease);
      if (progress < 1) requestAnimationFrame(animateScroll);
    };
    requestAnimationFrame(animateScroll);
  };

  const filteredChapters = useMemo(() => {
    const matched = Chapters.filter((chap) => chapterMatches(chap, filter));
    return sortCatalog(matched, filter.sort, {
      getFacets: getSimulationFacets,
      getName: (chap) => chap.name,
      getRecency: (chap) => chap.id,
    });
  }, [filter]);

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
    ? LEVELS[filter.levels[0]]?.name
    : null;

  return (
    <div
      className={`simulations-container ${isCompleted ? "notranslate" : ""}`}
    >
      {showHero && (
        <section className="simulations-hero">
          <p className="simulations-hero__title">
            {t("Interactive Physics Simulations")}
          </p>
          <p>
            {t(
              "Explore core physics concepts through real-time, interactive experiments"
            )}
          </p>
          <button
            className="ph-btn ph-btn--primary main-btn"
            onClick={handleStart}
          >
            {t("Let's begin")}
          </button>
        </section>
      )}

      <section ref={contentRef} className="simulations-content">
        <h1 className="simulations-content__title">
          {t("Interactive Physics Simulations")}
        </h1>
        <Search
          dataset={Chapters}
          getFacets={getSimulationFacets}
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
