"use client";
// The Formulary: every formula card on one page, filtered by the shared
// catalogue <Search> bar and grouped by domain. A link to /formulas#<id> (from
// a simulation, an article or a related formula) opens that card, scrolls to
// it and highlights it — and keeps it visible even if a filter would hide it.

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "../../../(core)/components/Search";
import FormulaCard from "../../../(core)/components/formulas/FormulaCard";
import useTranslation from "../../../(core)/hooks/useTranslation";
import useCurriculum from "../../../(core)/hooks/useCurriculum";
import {
  DOMAINS,
  formulas as allFormulas,
  formulaById,
  plainText,
} from "../../../(core)/data/formulas/index.js";
import {
  getFormulaFacets,
  facetMatches,
  hasActiveFacets,
  sortCatalog,
  DEFAULT_SORT,
  UNDATED_SORT_OPTIONS,
} from "../../../(core)/utils/catalogFilters.js";

const formulas = allFormulas;

const emptyFilter = {
  text: "",
  tags: [],
  levels: [],
  difficulties: [],
  sort: DEFAULT_SORT,
};

const domainName = Object.fromEntries(DOMAINS.map((d) => [d.id, d.name]));

// Everything a reader might type: names, other names, the summary, the names
// and symbols of the variables, topics and the domain.
const searchText = (f) =>
  [
    f.name,
    ...(f.aka || []),
    plainText(f.summary),
    ...f.variables.map((v) => `${plainText(v.name)} ${v.key}`),
    ...f.tags.map((tag) => tag.name),
    domainName[f.domain],
  ]
    .join(" ")
    .toLowerCase();

const SEARCH_INDEX = Object.fromEntries(
  formulas.map((f) => [f.id, searchText(f)])
);

const textMatches = (f, text) =>
  text
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => SEARCH_INDEX[f.id].includes(term));

export default function Formulary({ usage }) {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const { curriculumId } = useCurriculum();
  const [filter, setFilter] = useState(emptyFilter);
  // The card a #hash points at; `n` re-triggers the scroll on repeat clicks.
  const [target, setTarget] = useState(null);

  const getFacets = useCallback(
    (f) => getFormulaFacets(f, curriculumId),
    [curriculumId]
  );

  const visible = useMemo(() => {
    const matched = formulas.filter(
      (f) =>
        f.id === target?.id ||
        (textMatches(f, filter.text) && facetMatches(getFacets(f), filter))
    );
    return sortCatalog(matched, filter.sort, {
      getFacets,
      curriculumId,
      getName: (f) => f.name,
    });
  }, [filter, target, getFacets, curriculumId]);

  // Grouped by domain in the curated order; any other sort is one flat list.
  const groups = useMemo(() => {
    if (filter.sort !== DEFAULT_SORT)
      return [{ id: "all", name: "", items: visible }];
    return DOMAINS.map((d) => ({
      id: d.id,
      name: d.name,
      items: visible.filter((f) => f.domain === d.id),
    })).filter((g) => g.items.length > 0);
  }, [visible, filter.sort]);

  useEffect(() => {
    const onHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (formulaById[id]) setTarget({ id, n: Date.now() });
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // After the targeted card has rendered: open it, bring it into view, flash.
  useEffect(() => {
    if (!target) return;
    const card = document.getElementById(target.id);
    if (!card) return;
    card.querySelector("details")?.setAttribute("open", "");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    card.scrollIntoView({
      block: "start",
      behavior: reduceMotion ? "auto" : "smooth",
    });
    card.classList.add("fx--flash");
    const timer = setTimeout(() => card.classList.remove("fx--flash"), 1800);
    return () => clearTimeout(timer);
  }, [target]);

  // Scroll-spy for the index: the domain whose heading last crossed the top.
  const [activeDomain, setActiveDomain] = useState(DOMAINS[0].id);
  useEffect(() => {
    const sections = [...document.querySelectorAll("[data-domain]")];
    if (!sections.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (!visibleEntries.length) return;
        const top = visibleEntries.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
        )[0];
        setActiveDomain(top.target.getAttribute("data-domain"));
      },
      { rootMargin: "-120px 0px -55% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [groups]);

  const hasAnyFilter = hasActiveFacets(filter);
  const grouped = filter.sort === DEFAULT_SORT;
  const withCalculator = formulas.filter(
    (f) => Object.keys(f.solve || {}).length > 0
  ).length;

  return (
    <div className={`formulary ${isCompleted ? "notranslate" : ""}`}>
      <header className="formulary__header">
        <h1 className="formulary__title">{t("Physics Formulary")}</h1>
        <p className="formulary__intro">
          {t(
            "Every formula used in our simulations and articles, each with its own identity card: what every symbol means, when the formula holds, a calculator, and where to see it in action."
          )}
        </p>
        <p className="formulary__stats">
          <span>
            {formulas.length} {t("formulas")}
          </span>
          <span>
            {DOMAINS.length} {t("domains")}
          </span>
          <span>
            {withCalculator} {t("with a calculator")}
          </span>
        </p>
      </header>

      <div className="formulary__layout">
        <aside className="formulary__index" aria-label={t("Domains")}>
          <nav className={`fx-index ${grouped ? "" : "fx-index--flat"}`}>
            {DOMAINS.map((d) => {
              const items = visible.filter((f) => f.domain === d.id);
              if (!items.length) return null;
              return (
                <div
                  key={d.id}
                  className={`fx-index__group ${
                    grouped && activeDomain === d.id ? "is-active" : ""
                  }`}
                >
                  <a
                    className="fx-index__domain"
                    href={grouped ? `#domain-${d.id}` : `#${items[0].id}`}
                  >
                    <span>{t(d.name)}</span>
                    <span className="fx-index__count">{items.length}</span>
                  </a>
                  <ul className="fx-index__list">
                    {items.map((f) => (
                      <li key={f.id}>
                        <a href={`#${f.id}`}>{f.name}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        <div className="formulary__main">
          <Search
            dataset={formulas}
            getFacets={getFacets}
            onChange={setFilter}
            itemNoun={/* i18n */ "formulas"}
            resultCount={visible.length}
            sortOptions={UNDATED_SORT_OPTIONS}
          />

          {grouped && !hasAnyFilter && (
            <nav className="formulary__chips" aria-label={t("Domains")}>
              {DOMAINS.map((d) => (
                <a key={d.id} href={`#domain-${d.id}`}>
                  {t(d.name)}
                </a>
              ))}
            </nav>
          )}

          {groups.map((group) => (
            <section
              key={group.id}
              id={group.name ? `domain-${group.id}` : undefined}
              data-domain={group.name ? group.id : undefined}
              className="formulary__group"
              aria-labelledby={
                group.name ? `domain-${group.id}-title` : undefined
              }
            >
              {group.name && (
                <h2
                  className="formulary__group-title"
                  id={`domain-${group.id}-title`}
                >
                  {t(group.name)}
                  <span className="formulary__group-count">
                    {group.items.length}
                  </span>
                </h2>
              )}
              <div className="formulary__list">
                {group.items.map((f) => (
                  <FormulaCard key={f.id} formula={f} usage={usage[f.id]} />
                ))}
              </div>
            </section>
          ))}

          {visible.length === 0 && hasAnyFilter && (
            <p className="formulary__empty">{t("No formulas found")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
