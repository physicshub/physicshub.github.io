"use client";
// app/(core)/components/Search.jsx
//
// The catalogue filter bar shared by /simulations and /blog. One always-visible
// search field, a row of popover triggers (School level · Difficulty · Topic ·
// Sort) and, once anything is picked, a live result count with removable chips.
// On phones every popover becomes a bottom sheet. Filter + sort state
// round-trips through the URL (?q=&levels=&difficulty=&tags=&sort=) so a
// narrowed view stays shareable.

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
  faChevronDown,
  faGraduationCap,
  faGaugeHigh,
  faTags,
  faArrowDownWideShort,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Tag from "./Tag";
import useTranslation from "../hooks/useTranslation.ts";
import useMobile from "../hooks/useMobile.ts";
import TAGS, { LEVELS, LEVEL_ORDER, DIFFICULTIES } from "../data/tags.js";
import { SORT_OPTIONS, DEFAULT_SORT } from "../utils/catalogFilters.js";

const TAGS_MAP = Object.values(TAGS).reduce((acc, tag) => {
  acc[tag.name] = tag;
  return acc;
}, {});

const URL_PARAM = {
  text: "q",
  tags: "tags",
  levels: "levels",
  difficulties: "difficulty",
  sort: "sort",
};

const readFilterFromUrl = () => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const split = (key) => params.get(key)?.split(",").filter(Boolean) || [];

  const text = params.get(URL_PARAM.text) || "";
  const tags = split(URL_PARAM.tags);
  const levels = split(URL_PARAM.levels);
  const difficulties = split(URL_PARAM.difficulties);
  const sort = params.get(URL_PARAM.sort) || DEFAULT_SORT;

  if (
    !text &&
    !tags.length &&
    !levels.length &&
    !difficulties.length &&
    sort === DEFAULT_SORT
  ) {
    return null;
  }
  return { text, tags, levels, difficulties, sort };
};

const writeFilterToUrl = ({ text, tags, levels, difficulties, sort }) => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (text.trim()) params.set(URL_PARAM.text, text);
  if (tags.length) params.set(URL_PARAM.tags, tags.join(","));
  if (levels.length) params.set(URL_PARAM.levels, levels.join(","));
  if (difficulties.length)
    params.set(URL_PARAM.difficulties, difficulties.join(","));
  if (sort && sort !== DEFAULT_SORT) params.set(URL_PARAM.sort, sort);

  const query = params.toString();
  const url = query
    ? `${window.location.pathname}?${query}`
    : window.location.pathname;
  window.history.replaceState(null, "", url);
};

// ─── One popover (dropdown on desktop, bottom sheet on phones) ────────────────
function FilterPopover({
  id,
  openId,
  setOpenId,
  icon,
  label,
  activeCount,
  isMobile,
  children,
  t,
}) {
  const isOpen = openId === id;
  const close = useCallback(() => setOpenId(null), [setOpenId]);

  return (
    <div className="filterbar__control">
      <button
        type="button"
        className={`filterbar__trigger${
          activeCount ? " filterbar__trigger--active" : ""
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setOpenId(isOpen ? null : id)}
      >
        <FontAwesomeIcon icon={icon} className="filterbar__trigger-icon" />
        <span>{label}</span>
        {activeCount ? (
          <span className="filterbar__count">{activeCount}</span>
        ) : null}
        <FontAwesomeIcon
          icon={faChevronDown}
          className="filterbar__trigger-caret"
        />
      </button>

      {isOpen && (
        <>
          {isMobile && (
            <div
              className="filterbar__backdrop"
              onClick={close}
              aria-hidden="true"
            />
          )}
          <div
            className={`filterbar__pop filterbar__pop--${id}`}
            role="dialog"
            aria-label={label}
          >
            <div className="filterbar__pop-head">
              <span className="filterbar__pop-title">{label}</span>
              <button
                type="button"
                className="filterbar__pop-done"
                onClick={close}
              >
                {t("Done")}
              </button>
            </div>
            <div className="filterbar__pop-body">{children}</div>
          </div>
        </>
      )}
    </div>
  );
}

// A single checkable row inside a popover.
function OptionRow({ tag, sub, count, selected, disabled, radio, onClick, t }) {
  return (
    <button
      type="button"
      className="filterbar__opt"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      <span
        className={`filterbar__opt-mark${
          radio ? " filterbar__opt-mark--radio" : ""
        }${selected ? " is-on" : ""}`}
        aria-hidden="true"
      >
        {selected && <FontAwesomeIcon icon={faCheck} />}
      </span>
      <span className="filterbar__opt-main">
        {tag ? (
          <Tag tag={{ ...tag, name: t(tag.name) }} />
        ) : (
          <span className="filterbar__opt-name">{t(sub)}</span>
        )}
        {tag && sub ? (
          <span className="filterbar__opt-sub">{t(sub)}</span>
        ) : null}
      </span>
      {count !== undefined && (
        <span className="filterbar__opt-count">{count}</span>
      )}
    </button>
  );
}

export function Search({
  dataset = [],
  getFacets = () => ({ levels: [], difficulties: [], topics: [] }),
  onChange,
  onFilter, // legacy alias
  extraButton,
  itemNoun = "results",
  resultCount,
}) {
  const emit = onChange || onFilter;
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const isMobile = useMobile();

  const [searchText, setSearchText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [openId, setOpenId] = useState(null);
  const wrapperRef = useRef(null);

  const emitFilter = useCallback(
    (next) => {
      const payload = {
        text: next.text,
        tags: next.tags,
        levels: next.levels,
        difficulties: next.difficulties,
        sort: next.sort,
      };
      emit?.(payload);
      writeFilterToUrl(payload);
    },
    [emit]
  );

  const current = () => ({
    text: searchText,
    tags: selectedTags,
    levels: selectedLevels,
    difficulties: selectedDifficulties,
    sort,
  });

  // Hydrate from the URL after mount (client-only).
  useEffect(() => {
    const fromUrl = readFilterFromUrl();
    if (!fromUrl) return;
    setSearchText(fromUrl.text);
    setSelectedTags(fromUrl.tags);
    setSelectedLevels(fromUrl.levels);
    setSelectedDifficulties(fromUrl.difficulties);
    setSort(fromUrl.sort);
    emit?.(fromUrl);
  }, []);

  // Dismiss an open popover on outside click / Escape.
  useEffect(() => {
    if (!openId) return;
    const onDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpenId(null);
      }
    };
    const onKey = (e) => e.key === "Escape" && setOpenId(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  // Lock the page behind a bottom sheet.
  useEffect(() => {
    if (!openId || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openId, isMobile]);

  // How many catalogue items sit behind each option, so the popovers can show
  // counts and grey out choices that would land on an empty page.
  const counts = useMemo(() => {
    const level = {};
    const difficulty = {};
    const topic = {};
    for (const item of dataset) {
      const f = getFacets(item);
      for (const id of new Set(f.levels)) level[id] = (level[id] || 0) + 1;
      for (const id of new Set(f.difficulties))
        difficulty[id] = (difficulty[id] || 0) + 1;
      for (const name of new Set(f.topics))
        topic[name] = (topic[name] || 0) + 1;
    }
    return { level, difficulty, topic };
  }, [dataset]);

  const activeChips = [
    ...selectedLevels.map((id) => ({
      key: `level:${id}`,
      data: LEVELS[id],
      remove: () => toggleLevel(id),
    })),
    ...selectedDifficulties.map((id) => ({
      key: `diff:${id}`,
      data: DIFFICULTIES[id],
      remove: () => toggleDifficulty(id),
    })),
    ...selectedTags.map((name) => ({
      key: `tag:${name}`,
      data: TAGS_MAP[name],
      remove: () => toggleTopic(name),
    })),
  ].filter((chip) => chip.data);

  const hasAnyFilter =
    searchText.trim() !== "" ||
    selectedTags.length > 0 ||
    selectedLevels.length > 0 ||
    selectedDifficulties.length > 0;

  const total = dataset.length;
  const shown = resultCount ?? total;
  const noun = t(itemNoun);
  const countLabel =
    !hasAnyFilter || shown === total
      ? `${total} ${noun}`
      : `${shown} / ${total} ${noun}`;

  // ── mutators ──────────────────────────────────────────────────────────────
  const toggleIn = (list, value) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const toggleLevel = (id) => {
    const next = { ...current(), levels: toggleIn(selectedLevels, id) };
    setSelectedLevels(next.levels);
    emitFilter(next);
  };
  const toggleDifficulty = (id) => {
    const next = {
      ...current(),
      difficulties: toggleIn(selectedDifficulties, id),
    };
    setSelectedDifficulties(next.difficulties);
    emitFilter(next);
  };
  const toggleTopic = (name) => {
    const next = { ...current(), tags: toggleIn(selectedTags, name) };
    setSelectedTags(next.tags);
    emitFilter(next);
  };
  const changeSort = (id) => {
    const next = { ...current(), sort: id };
    setSort(id);
    emitFilter(next);
    setOpenId(null);
  };
  const changeText = (e) => {
    const text = e.target.value;
    const next = { ...current(), text };
    setSearchText(text);
    emitFilter(next);
  };
  const clearAll = () => {
    const next = {
      text: "",
      tags: [],
      levels: [],
      difficulties: [],
      sort: DEFAULT_SORT,
    };
    setSearchText("");
    setSelectedTags([]);
    setSelectedLevels([]);
    setSelectedDifficulties([]);
    setSort(DEFAULT_SORT);
    emitFilter(next);
  };

  const sortLabel = t(
    SORT_OPTIONS.find((o) => o.id === sort)?.label || "Recommended"
  );

  return (
    <div
      className={`filterbar ${isCompleted ? "notranslate" : ""}`}
      ref={wrapperRef}
    >
      <div className="filterbar__search">
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="filterbar__search-icon"
        />
        <input
          type="search"
          name="query"
          placeholder={t("Search by name, topic or level…")}
          aria-label={t("Search")}
          value={searchText}
          onChange={changeText}
        />
        {searchText && (
          <button
            type="button"
            className="filterbar__search-clear"
            onClick={() => changeText({ target: { value: "" } })}
            aria-label={t("Clear search")}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>

      <div className="filterbar__controls">
        <FilterPopover
          id="levels"
          openId={openId}
          setOpenId={setOpenId}
          icon={faGraduationCap}
          label={t("School level")}
          activeCount={selectedLevels.length}
          isMobile={isMobile}
          t={t}
        >
          {LEVEL_ORDER.map((level) => (
            <OptionRow
              key={level.id}
              tag={level}
              sub={level.age}
              count={counts.level[level.id] || 0}
              selected={selectedLevels.includes(level.id)}
              disabled={!counts.level[level.id]}
              onClick={() => toggleLevel(level.id)}
              t={t}
            />
          ))}
        </FilterPopover>

        <FilterPopover
          id="difficulty"
          openId={openId}
          setOpenId={setOpenId}
          icon={faGaugeHigh}
          label={t("Difficulty")}
          activeCount={selectedDifficulties.length}
          isMobile={isMobile}
          t={t}
        >
          {Object.values(DIFFICULTIES).map((difficulty) => (
            <OptionRow
              key={difficulty.id}
              tag={difficulty}
              count={counts.difficulty[difficulty.id] || 0}
              selected={selectedDifficulties.includes(difficulty.id)}
              disabled={!counts.difficulty[difficulty.id]}
              onClick={() => toggleDifficulty(difficulty.id)}
              t={t}
            />
          ))}
        </FilterPopover>

        <FilterPopover
          id="topics"
          openId={openId}
          setOpenId={setOpenId}
          icon={faTags}
          label={t("Topic")}
          activeCount={selectedTags.length}
          isMobile={isMobile}
          t={t}
        >
          {Object.values(TAGS)
            .slice()
            .sort(
              (a, b) =>
                (counts.topic[b.name] || 0) - (counts.topic[a.name] || 0)
            )
            .map((topic) => (
              <OptionRow
                key={topic.name}
                tag={topic}
                count={counts.topic[topic.name] || 0}
                selected={selectedTags.includes(topic.name)}
                disabled={!counts.topic[topic.name]}
                onClick={() => toggleTopic(topic.name)}
                t={t}
              />
            ))}
        </FilterPopover>

        <div className="filterbar__spacer" />

        <FilterPopover
          id="sort"
          openId={openId}
          setOpenId={setOpenId}
          icon={faArrowDownWideShort}
          label={`${t("Sort")}: ${sortLabel}`}
          activeCount={0}
          isMobile={isMobile}
          t={t}
        >
          {SORT_OPTIONS.map((option) => (
            <OptionRow
              key={option.id}
              sub={option.label}
              radio
              selected={sort === option.id}
              onClick={() => changeSort(option.id)}
              t={t}
            />
          ))}
        </FilterPopover>

        {extraButton}
      </div>

      <div className="filterbar__meta">
        <span className="filterbar__result-count">{countLabel}</span>

        {activeChips.map((chip) => (
          <span key={chip.key} className="filterbar__chip">
            <Tag tag={{ ...chip.data, name: t(chip.data.name) }} />
            <button
              type="button"
              className="filterbar__chip-remove"
              onClick={chip.remove}
              aria-label={`${t("Remove filter")} ${t(chip.data.name)}`}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </span>
        ))}

        {hasAnyFilter && (
          <button type="button" className="filterbar__clear" onClick={clearAll}>
            {t("Clear all")}
          </button>
        )}
      </div>
    </div>
  );
}

export default Search;
