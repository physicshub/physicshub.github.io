// app/pages/simulations.jsx
"use client";
import { useState } from "react";
import Chapter from "../../(core)/components/Chapter.jsx";
import Chapters from "../../(core)/data/chapters.js";
import { Search } from '../../(core)/components/Search';

const getChapterTagNames = (tags) => tags.map(tag => tag.name.toLowerCase());

export default function Simulations() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChapters = Chapters.filter((chap) => {
    const searchTerms = searchTerm
      .toLowerCase()
      .trim()
      .split(/\s+/) 
      .filter(term => term.length > 0);

    if (searchTerms.length === 0) {
      return true;
    }
    
    const chapterTagNames = getChapterTagNames(chap.tags);

    const matchesAllTerms = searchTerms.every(term => {
        const matchesName = chap.name.toLowerCase().includes(term);
        const matchesTag = chapterTagNames.includes(term);

        return matchesName || matchesTag;
    });

    return matchesAllTerms;
  });

  return (
    <div className="simulations-container">
      <Search onSearch={setSearchTerm} />
      <main className="simulations-page">
        {filteredChapters.map((chap) => (
          <Chapter
            key={chap.id}
            id={chap.id}
            name={chap.name}
            desc={chap.desc}
            link={chap.link}
            tags={chap.tags}
          />
        ))}
      </main>
    </div>
  );
}