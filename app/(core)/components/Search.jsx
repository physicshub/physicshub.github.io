"use client";
// app/components/Search.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFilter,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useCallback, useEffect } from "react";
import Tag from "./Tag";
import useTranslation from "../hooks/useTranslation.ts";
import TAGS, { LEVELS, LEVEL_ORDER, DIFFICULTIES } from "../data/tags.js";
import Chapters from "../data/chapters.js";

const TAGS_MAP = Object.values(TAGS).reduce((acc, tag) => {
  acc[tag.name] = tag;
  return acc;
}, {});

// How many simulations each topic actually covers today, so the filter can't
// walk a visitor into a guaranteed-empty result silently.
const TOPIC_COUNTS = Object.values(TAGS).reduce((acc, tag) => {
  acc[tag.name] = Chapters.filter((chap) =>
    chap.tags?.some((chapTag) => chapTag.name === tag.name)
  ).length;
  return acc;
}, {});

// Filter state round-trips through the URL (?q=&tags=&levels=&difficulty=) so a
// filtered view is bookmarkable and shareable, e.g. by a teacher linking a
// colleague straight to "upperSecondary + core".
const URL_PARAM = {
  text: "q",
  tags: "tags",
  levels: "levels",
  difficulties: "difficulty",
};

const readFilterFromUrl = () => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const split = (key) => params.get(key)?.split(",").filter(Boolean) || [];

  const text = params.get(URL_PARAM.text) || "";
  const tags = split(URL_PARAM.tags);
  const levels = split(URL_PARAM.levels);
  const difficulties = split(URL_PARAM.difficulties);

  if (!text && !tags.length && !levels.length && !difficulties.length) {
    return null;
  }
  return { text, tags, levels, difficulties };
};

const writeFilterToUrl = (text, tags, levels, difficulties) => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (text.trim()) params.set(URL_PARAM.text, text);
  if (tags.length) params.set(URL_PARAM.tags, tags.join(","));
  if (levels.length) params.set(URL_PARAM.levels, levels.join(","));
  if (difficulties.length)
    params.set(URL_PARAM.difficulties, difficulties.join(","));

  const query = params.toString();
  const url = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;
  window.history.replaceState(null, "", url);
};

export function Search({ onFilter, extraButton }) {
  const [searchText, setSearchText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  const emitFilter = useCallback(
    (text, tags, levels, difficulties) => {
      onFilter?.({ text, tags, levels, difficulties });
      writeFilterToUrl(text, tags, levels, difficulties);
    },
    [onFilter]
  );

  // Hydrate from the URL after mount (client-only, so this never fights the
  // server-rendered empty state during hydration).
  useEffect(() => {
    const fromUrl = readFilterFromUrl();
    if (!fromUrl) return;

    setSearchText(fromUrl.text);
    setSelectedTags(fromUrl.tags);
    setSelectedLevels(fromUrl.levels);
    setSelectedDifficulties(fromUrl.difficulties);
    onFilter?.(fromUrl);
  }, []);

  const hasAnyFilter =
    searchText.trim() !== "" ||
    selectedTags.length > 0 ||
    selectedLevels.length > 0 ||
    selectedDifficulties.length > 0;

  const handleClearAll = useCallback(() => {
    setSearchText("");
    setSelectedTags([]);
    setSelectedLevels([]);
    setSelectedDifficulties([]);
    emitFilter("", [], [], []);
  }, [emitFilter]);

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleTagToggle = useCallback(
    (tagName) => {
      let newTags;
      if (selectedTags.includes(tagName)) {
        newTags = selectedTags.filter((tag) => tag !== tagName);
      } else {
        newTags = [...selectedTags, tagName];
      }

      setSelectedTags(newTags);
      emitFilter(searchText, newTags, selectedLevels, selectedDifficulties);
    },
    [selectedTags, searchText, selectedLevels, selectedDifficulties, emitFilter]
  );

  const handleLevelToggle = useCallback(
    (levelId) => {
      let newLevels;
      if (selectedLevels.includes(levelId)) {
        newLevels = selectedLevels.filter((l) => l !== levelId);
      } else {
        newLevels = [...selectedLevels, levelId];
      }

      setSelectedLevels(newLevels);
      emitFilter(searchText, selectedTags, newLevels, selectedDifficulties);
    },
    [selectedLevels, searchText, selectedTags, selectedDifficulties, emitFilter]
  );

  const handleDifficultyToggle = useCallback(
    (difficultyId) => {
      let newDifficulties;
      if (selectedDifficulties.includes(difficultyId)) {
        newDifficulties = selectedDifficulties.filter(
          (d) => d !== difficultyId
        );
      } else {
        newDifficulties = [...selectedDifficulties, difficultyId];
      }

      setSelectedDifficulties(newDifficulties);
      emitFilter(searchText, selectedTags, selectedLevels, newDifficulties);
    },
    [selectedDifficulties, searchText, selectedTags, selectedLevels, emitFilter]
  );

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setSearchText(newText);
    emitFilter(newText, selectedTags, selectedLevels, selectedDifficulties);
  };

  const handleRemoveSelectedTag = useCallback(
    (tagName) => {
      handleTagToggle(tagName);
    },
    [handleTagToggle]
  );

  const handleRemoveSelectedLevel = useCallback(
    (levelId) => {
      handleLevelToggle(levelId);
    },
    [handleLevelToggle]
  );

  const handleRemoveSelectedDifficulty = useCallback(
    (difficultyId) => {
      handleDifficultyToggle(difficultyId);
    },
    [handleDifficultyToggle]
  );

  const renderSelectedChip = (key, tagData, onRemove) => {
    if (!tagData) return null;

    return (
      <div key={key} className="selected-tag-wrapper">
        <Tag tag={tagData} />
        <button
          type="button"
          className="remove-tag-btn"
          onClick={() => onRemove(key)}
          aria-label={`${t("Remove filter")} ${t(tagData.name)}`}
        >
          <FontAwesomeIcon icon={faTimesCircle} />
        </button>
      </div>
    );
  };

  return (
    <div className={`search-wrapper ${isCompleted ? "notranslate" : ""}`}>
      <div className="search-header">
        <form
          className="search-container"
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />

          <div className="tag-input-area">
            {selectedTags.map((tagName) => {
              const tagData = TAGS_MAP[tagName];
              if (!tagData) return null;
              return renderSelectedChip(
                tagName,
                tagData,
                handleRemoveSelectedTag
              );
            })}

            {selectedLevels.map((levelId) => {
              const levelData = LEVELS[levelId];
              if (!levelData) return null;
              return renderSelectedChip(
                levelId,
                levelData,
                handleRemoveSelectedLevel
              );
            })}

            {selectedDifficulties.map((difficultyId) => {
              const difficultyData = DIFFICULTIES[difficultyId];
              if (!difficultyData) return null;
              return renderSelectedChip(
                difficultyId,
                difficultyData,
                handleRemoveSelectedDifficulty
              );
            })}

            <input
              type="search"
              name="query"
              placeholder={t("Search...")}
              aria-label={t("Search")}
              value={searchText}
              onChange={handleTextChange}
            />
          </div>
        </form>

        <button
          className={`filter-toggle ${isMenuOpen ? "open" : ""}`}
          onClick={handleMenuToggle}
          aria-expanded={isMenuOpen}
          aria-label={t("Toggle filters menu")}
        >
          <FontAwesomeIcon icon={faFilter} />
        </button>
        {hasAnyFilter && (
          <button
            type="button"
            className="clear-filters-btn"
            onClick={handleClearAll}
          >
            {t("Clear all")}
          </button>
        )}
        {extraButton}
      </div>

      {/* Filters container */}
      <div className={`horizontal-menu-container ${isMenuOpen ? "open" : ""}`}>
        <div className="horizontal-menu">
          <span className="filter-group-label">{t("School level")}</span>
          {LEVEL_ORDER.map((level) => {
            const levelId = level.id;
            const isSelected = selectedLevels.includes(levelId);

            return (
              <button
                key={levelId}
                className="filter-button"
                onClick={() => handleLevelToggle(levelId)}
                aria-pressed={isSelected}
                title={`${t(level.name)} — ${t(level.age)}`}
              >
                <Tag tag={level} className={isSelected ? "tag-selected" : ""} />
              </button>
            );
          })}

          <span className="filter-group-label">{t("Difficulty")}</span>
          {Object.values(DIFFICULTIES).map((difficulty) => {
            const isSelected = selectedDifficulties.includes(difficulty.id);

            return (
              <button
                key={difficulty.id}
                className="filter-button"
                onClick={() => handleDifficultyToggle(difficulty.id)}
                aria-pressed={isSelected}
                title={t(difficulty.name)}
              >
                <Tag
                  tag={difficulty}
                  className={isSelected ? "tag-selected" : ""}
                />
              </button>
            );
          })}

          <span className="filter-group-label">{t("Topic")}</span>
          {Object.values(TAGS).map((filter) => {
            const tagName = filter.name;
            const isSelected = selectedTags.includes(tagName);
            const count = TOPIC_COUNTS[tagName] || 0;
            const isEmpty = count === 0;

            return (
              <button
                key={tagName}
                className={`filter-button ${isEmpty ? "filter-button--empty" : ""}`}
                onClick={() => !isEmpty && handleTagToggle(tagName)}
                disabled={isEmpty}
                aria-pressed={isSelected}
                aria-disabled={isEmpty}
                title={
                  isEmpty
                    ? `${t(tagName)} — ${t("No simulations for this topic yet")}`
                    : t(tagName)
                }
              >
                <Tag
                  tag={filter}
                  className={isSelected ? "tag-selected" : ""}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
