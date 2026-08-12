"use client";
// app/components/Search.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFilter,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useCallback } from "react";
import Tag from "./Tag";
import useTranslation from "../hooks/useTranslation.ts";
import TAGS, { LEVELS, LEVEL_ORDER, DIFFICULTIES } from "../data/tags.js";

const TAGS_MAP = Object.values(TAGS).reduce((acc, tag) => {
  acc[tag.name] = tag;
  return acc;
}, {});

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
    },
    [onFilter]
  );

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

            return (
              <button
                key={tagName}
                className="filter-button"
                onClick={() => handleTagToggle(tagName)}
                aria-pressed={isSelected}
                title={t(tagName)}
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
