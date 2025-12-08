// app/pages/simulations.jsx
"use client";
import { useState } from "react";
import Chapter from "../../(core)/components/Chapter.jsx";
import Chapters from "../../(core)/data/chapters.js";
import { Search } from '../../(core)/components/Search';

export default function Simulations() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChapters = Chapters.filter((chap) => {
    const term = searchTerm.toLowerCase();

    const matchesName = chap.name.toLowerCase().includes(term);

    const matchesTags = chap.tags.some((tag) =>
      tag.name.toLowerCase().includes(term)
    );

    return matchesName || matchesTags;
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
