// app/components/Search.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFilter,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useCallback } from "react";
import Tag from "./Tag";
import TAGS from "../data/tags";

const TAGS_MAP = Object.values(TAGS).reduce((acc, tag) => {
  acc[tag.name] = tag;
  return acc;
}, {});

const dispatchSearch = (onSearch, tags, text) => {
  const combinedQuery = [...tags, text].filter(Boolean).join(" ").trim();
  onSearch?.(combinedQuery);
};

export function Search({ onSearch, extraButton }) {
  const [searchText, setSearchText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      dispatchSearch(onSearch, newTags, searchText);
    },
    [selectedTags, searchText, onSearch]
  );

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setSearchText(newText);
    dispatchSearch(onSearch, selectedTags, newText);
  };

  const handleRemoveSelectedTag = useCallback(
    (tagName) => {
      handleTagToggle(tagName);
    },
    [handleTagToggle]
  );

  return (
    <div className="search-wrapper">
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

              return (
                <div key={tagName} className="selected-tag-wrapper">
                  <Tag tag={tagData} />
                  <button
                    type="button"
                    className="remove-tag-btn"
                    onClick={() => handleRemoveSelectedTag(tagName)}
                    aria-label={`Remove filter ${tagName}`}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </button>
                </div>
              );
            })}

            <input
              type="search"
              name="query"
              placeholder={selectedTags.length > 0 ? "" : "Search..."}
              aria-label="Search"
              value={searchText}
              onChange={handleTextChange}
            />
          </div>
        </form>

        <button
          className={`filter-toggle ${isMenuOpen ? "open" : ""}`}
          onClick={handleMenuToggle}
          aria-expanded={isMenuOpen}
          aria-label="Toggle filters menu"
        >
          <FontAwesomeIcon icon={faFilter} />
        </button>
        {extraButton}
      </div>

      {/* Filters container */}
      <div className={`horizontal-menu-container ${isMenuOpen ? "open" : ""}`}>
        <div className="horizontal-menu">
          {Object.values(TAGS).map((filter) => {
            const tagName = filter.name;
            const isSelected = selectedTags.includes(tagName);

            return (
              <button
                key={tagName}
                className="filter-button"
                onClick={() => handleTagToggle(tagName)}
                aria-pressed={isSelected}
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
