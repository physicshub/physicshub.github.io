"use client";
// app/(core)/components/CurriculumSelector.jsx
//
// Header control for the reader's school curriculum. Levels across the site
// (cards, filters, the banner on a simulation) are worded in this system: "Year
// 12 · A-Level" in the UK, "Class 11" in India, "Sec 3" in Singapore. It is
// picked automatically from the browser (see utils/detectCurriculum.js); a
// manual choice is saved and wins over detection.

import { useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faChevronDown,
  faCheck,
  faLocationCrosshairs,
} from "@fortawesome/free-solid-svg-icons";
import useTranslation from "../hooks/useTranslation.ts";
import useCurriculum from "../hooks/useCurriculum.ts";
import { CURRICULA, CURRICULUM_ORDER } from "../data/curricula.js";

export default function CurriculumSelector() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const {
    curriculumId,
    curriculum,
    source,
    detected,
    setCurriculum,
    resetCurriculum,
  } = useCurriculum();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const choose = useCallback(
    (id) => {
      setCurriculum(id);
      setOpen(false);
    },
    [setCurriculum]
  );

  const handleAuto = useCallback(() => {
    resetCurriculum();
    setOpen(false);
  }, [resetCurriculum]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const detectedName = detected ? CURRICULA[detected]?.name : null;

  return (
    <div
      ref={containerRef}
      className={`curriculum-switcher ${isCompleted ? "notranslate" : ""}`.trim()}
    >
      <button
        type="button"
        className="curriculum-switcher__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("School curriculum")}: ${t(curriculum.name)}`}
        title={`${t("School curriculum")}: ${t(curriculum.name)}`}
        onClick={() => setOpen((value) => !value)}
      >
        <FontAwesomeIcon
          icon={faGraduationCap}
          className="curriculum-switcher__icon"
        />
        <span className="curriculum-switcher__code notranslate">
          {curriculum.code}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`curriculum-switcher__chevron ${open ? "is-open" : ""}`}
        />
      </button>

      {open ? (
        <div className="curriculum-switcher__menu">
          <p className="curriculum-switcher__title">{t("School curriculum")}</p>
          <p className="curriculum-switcher__hint">
            {t(
              "School levels across the site follow this syllabus. It is set from your browser's time zone and language — nothing is sent anywhere."
            )}
          </p>

          <ul role="listbox" className="curriculum-switcher__list">
            {CURRICULUM_ORDER.map((id) => {
              const option = CURRICULA[id];
              const active = id === curriculumId;
              return (
                <li key={id} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`curriculum-switcher__option ${active ? "is-active" : ""}`}
                    onClick={() => choose(id)}
                  >
                    <span className="curriculum-switcher__badge notranslate">
                      {option.code}
                    </span>
                    <span className="curriculum-switcher__label">
                      <span className="curriculum-switcher__name">
                        {t(option.name)}
                      </span>
                      <span className="curriculum-switcher__framework">
                        {t(option.framework)}
                      </span>
                    </span>
                    {active ? (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className="curriculum-switcher__check"
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          {source === "manual" ? (
            <button
              type="button"
              className="curriculum-switcher__auto"
              onClick={handleAuto}
            >
              <FontAwesomeIcon icon={faLocationCrosshairs} />
              {detectedName
                ? `${t("Detect automatically")} (${t(detectedName)})`
                : t("Detect automatically")}
            </button>
          ) : (
            <p className="curriculum-switcher__auto-note">
              <FontAwesomeIcon icon={faLocationCrosshairs} />
              {detectedName
                ? `${t("Detected automatically")}: ${t(detectedName)}`
                : t("No country detected — showing the international scale")}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
