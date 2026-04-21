"use client";
import { useState, useRef, useEffect } from "react";
import Chapter from "../../(core)/components/Chapter.jsx";
import Chapters from "../../(core)/data/chapters.js";
import { Search } from "../../(core)/components/Search";
import useTranslation from "../../(core)/hooks/useTranslation.ts";

const getChapterTagNames = (tags) => tags.map((tag) => tag.name.toLowerCase());

export default function Simulations() {
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;
  const [searchTerm, setSearchTerm] = useState("");
  const [showHero] = useState(() => {
    if (typeof window !== "undefined") {
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

  const filteredChapters = Chapters.filter((chap) => {
    const searchTerms = searchTerm
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter((term) => term.length > 0);

    if (searchTerms.length === 0) return true;

    const chapterTagNames = getChapterTagNames(chap.tags);

    return searchTerms.every((term) => {
      const normalizedTerm = term.replace(/\s+/g, "");

      const matchesName = chap.name.toLowerCase().includes(term);

      const matchesTag = chapterTagNames.includes(term);

      const matchesChapterNumber = chap.id && chap.id.toString().includes(term);

      const matchesChapterLabel =
        chap.id &&
        (`chapter${chap.id}`.includes(normalizedTerm) ||
          `ch${chap.id}`.includes(normalizedTerm));

      return (
        matchesName || matchesTag || matchesChapterNumber || matchesChapterLabel
      );
    });
  });

  return (
    <div
      className={`simulations-container ${isCompleted ? "notranslate" : ""}`}
    >
      {showHero && (
        <section className="simulations-hero">
          <h1>{t("Interactive Physics Simulations")}</h1>
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
        <Search onSearch={setSearchTerm} />
        <main className="simulations-page">
          {filteredChapters.map((chap) => (
            <Chapter key={chap.id} {...chap} />
          ))}
        </main>
      </section>
    </div>
  );
}
