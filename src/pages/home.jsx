import Header from "../components/Header.jsx"
import Footer from "../components/Footer.jsx"
import Chapter from "../components/Chapter.jsx"
import Chapters from "../chapters.json"

export function Home() {
  return(
    <>
      <Header/>
      <main>
        {Chapters.map((chap) => (
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
      <Footer/>
    </>
  );
}
