// src/pages/simulations.jsx
import { useState } from 'react';
import Chapter from "../components/Chapter.jsx";
import Chapters from "../data/chapters.js";

export default function Simulations() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChapters = Chapters.filter((chap) => {
    const term = searchTerm.toLowerCase();

    const matchesName = chap.name.toLowerCase().includes(term);

    const matchesTags = chap.tags.some((tag) =>
      tag.name.toLowerCase().includes(term)
    );

    return matchesName || matchesTags;
  });

  return (
    <main>
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
  );
}
