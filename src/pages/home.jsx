// src/pages/home.jsx
import { useState } from 'react';
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Chapter from "../components/Chapter.jsx";
import Chapters from "../chapters.json";

export function Home() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChapters = Chapters.filter((chap) => {
    const term = searchTerm.toLowerCase();

    // Controllo su nome e descrizione
    const matchesName = chap.name.toLowerCase().includes(term);

    // Controllo sui tag
    const matchesTags = chap.tags.some((tag) =>
      tag.name.toLowerCase().includes(term)
    );

    return matchesName || matchesTags;
  });

  return (
    <>
      <Header onSearch={setSearchTerm} />
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
      <Footer />
    </>
  );
}
