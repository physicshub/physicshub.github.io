// // app/(pages)/page.jsx
// "use client";
// import { useState } from "react";
// import Chapter from "../../(core)/components/Chapter.jsx";
// import Chapters from "../../(core)/data/chapters.js";
// import { Search } from "../../(core)/components/Search";

// const getChapterTagNames = (tags) =>
//   tags.map((tag) => tag.name.toLowerCase());

// export default function Simulations() {
//   const [searchTerm, setSearchTerm] = useState("");

//   const filteredChapters = Chapters.filter((chap) => {
//     const searchTerms = searchTerm
//       .toLowerCase()
//       .trim()
//       .split(/\s+/)
//       .filter((term) => term.length > 0);

//     if (searchTerms.length === 0) {
//       return true;
//     }

//     const chapterTagNames = getChapterTagNames(chap.tags);

//     return searchTerms.every((term) => {
//       const matchesName = chap.name.toLowerCase().includes(term);
//       const matchesTag = chapterTagNames.includes(term);
//       return matchesName || matchesTag;
//     });
//   });

//   return (
//     <div className="simulations-container">

//       {/* ✅ NEW: Page Header Section */}
//       <section className="simulations-header">
//         <h1>Interactive Physics Simulations</h1>
//         <p>
//           Explore core physics concepts through real-time, interactive experiments
//         </p>
//       </section>

//       {/* Existing search */}
//       <Search onSearch={setSearchTerm} />

//       {/* Simulation cards */}
//       <main className="simulations-page max-width-container">
//         {filteredChapters.map((chap) => (
//           <Chapter
//             key={chap.id}
//             id={chap.id}
//             name={chap.name}
//             desc={chap.desc}
//             link={chap.link}
//             tags={chap.tags}
//             icon={chap.icon}
//           />
//         ))}
//       </main>
//     </div>
//   );
// }











"use client";
import { useState, useRef, useEffect } from "react";
import Chapter from "../../(core)/components/Chapter.jsx";
import Chapters from "../../(core)/data/chapters.js";
import { Search } from "../../(core)/components/Search";

const getChapterTagNames = (tags) =>
  tags.map((tag) => tag.name.toLowerCase());

export default function Simulations() {
  const [searchTerm, setSearchTerm] = useState("");
  const contentRef = useRef(null);

  // Ensure page always starts at the top to prevent auto-scroll on refresh
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  // Smooth scroll immediately on button click (slower and natural)
  const scrollToContent = () => {
    if (!contentRef.current) return;

    const start = window.scrollY;
    const target = contentRef.current.offsetTop;
    const distance = target - start;
    const duration = 1200; // slower, natural scroll
    let startTime = null;

    const animateScroll = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Ease-in-out cubic for smooth natural feeling
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, start + distance * ease);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll); // start immediately
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
      {/* HERO SECTION */}
      <section className="simulations-hero">
        <h1>Interactive Physics Simulations</h1>
        <p>
          Explore core physics concepts through real-time, interactive experiments
        </p>

        <button className="begin-button" onClick={scrollToContent}>
          Let's begin
        </button>
      </section>

      {/* MAIN CONTENT */}
      <section ref={contentRef} className="simulations-content">
        <Search onSearch={setSearchTerm} />

        <main className="simulations-page max-width-container">
          {filteredChapters.map((chap) => (
            <Chapter
              key={chap.id}
              id={chap.id}
              name={chap.name}
              desc={chap.desc}
              link={chap.link}
              tags={chap.tags}
              icon={chap.icon}
            />
          ))}
        </main>
      </section>
    </div>
  );
}
