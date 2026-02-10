"use client";
import { useState, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import Chapter from "../../(core)/components/Chapter.jsx";
import Chapters from "../../(core)/data/chapters.js";
import { Search } from "../../(core)/components/Search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList } from "@fortawesome/free-solid-svg-icons";

const getChapterTagNames = (tags) => tags.map((tag) => tag.name.toLowerCase());

export default function Simulations() {
  const [searchTerm, setSearchTerm] = useState("");
  // Initialize with consistent value for SSR, then update on client
  const [showHero, setShowHero] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const contentRef = useRef(null);
  const duration = 1200;

  // Handle client-side hydration
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedSimulations");
    flushSync(() => {
      setIsClient(true);
      setShowHero(!hasVisited);
    });
    window.scrollTo(0, 0);
  }, []);

  const handleStart = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hasVisitedSimulations", "true");
    }
    setShowHero(false);
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
      const matchesName = chap.name.toLowerCase().includes(term);
      const matchesTag = chapterTagNames.includes(term);
      return matchesName || matchesTag;
    });
  });

  return (
    <div className="simulations-container">
      {/* RENDERING CONDIZIONALE DELLA HERO */}
      {/* Only render hero if showHero is true AND we're on client (to avoid hydration mismatch) */}
      {isClient && showHero && (
        <section className="simulations-hero">
          <h1>Interactive Physics Simulations</h1>
          <p>
            Explore core physics concepts through real-time, interactive
            experiments
          </p>
          <button
            className="ph-btn ph-btn--primary main-btn"
            onClick={handleStart}
          >
            Let&apos;s begin
          </button>
        </section>
      )}

      <section ref={contentRef} className="simulations-content">
        <Search onSearch={setSearchTerm} />
        <main className="simulations-page">
          {searchTerm === "" ? (
            <h2 className="simulations-header-title">
              <FontAwesomeIcon icon={faList} /> All Simulations
            </h2>
          ) : (
            <h2 className="simulations-header-title">Search Results</h2>
          )}
          <div className="simulations-list">
            {filteredChapters.map((chap) => (
              <Chapter key={chap.id} {...chap} />
            ))}
            {filteredChapters.length === 0 && searchTerm.length > 0 && (
              <p className="no-results">
                Nothing found for &quot;{searchTerm}&quot;.
              </p>
            )}
          </div>
        </main>
      </section>
    </div>
  );
}
