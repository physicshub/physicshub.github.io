// src/pages/simulations.jsx
import { useState } from 'react';
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Chapter from "../components/Chapter.jsx";
import Chapters from "../data/chapters.js";
import GradientBackground from '../components/GradientBackground.jsx';
import Stars from "../components/Stars.jsx";

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
    <>
      <Header onSearch={setSearchTerm} />
      <Stars opacity={0.4} zIndex={1} starDensity={0.005}/>
      <main>
        <GradientBackground />
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
