// app/(pages)/blog/page.jsx
"use client";
import { useState } from "react";
import Chapter from "../../(core)/components/Chapter.jsx";
import { blogsArray } from "../../(core)/data/articles/index.js";
import { Search } from "../../(core)/components/Search.jsx";
import { useRouter } from "next/navigation";
import useMobile from "../../(core)/hooks/useMobile.ts";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faThumbtack, faPlus } from "@fortawesome/free-solid-svg-icons";

const getChapterTagNames = (tags) => tags.map((tag) => tag.name.toLowerCase());

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const isMobile = useMobile();

  const pinnedBlogs = blogsArray.filter((chap) => chap.isPinned);
  const unpinnedBlogs = blogsArray.filter((chap) => !chap.isPinned);

  const filteredUnpinnedChapters = unpinnedBlogs.filter((chap) => {
    const searchTerms = searchTerm
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter((term) => term.length > 0);

    if (searchTerms.length === 0) {
      return true;
    }

    const chapterTagNames = getChapterTagNames(chap.tags);

    const matchesAllTerms = searchTerms.every((term) => {
      const matchesName = chap.name.toLowerCase().includes(term);
      const matchesTag = chapterTagNames.includes(term);

      return matchesName || matchesTag;
    });

    return matchesAllTerms;
  });

  const finalChapters = [...filteredUnpinnedChapters];

  const handleCreateNewBlog = () => {
    router.push("/blog/create");
  };

  return (
    <div className="simulations-container blogs-container">
      <div className="header-controls">
        <Search
          onSearch={setSearchTerm}
          extraButton={
            !isMobile ? (
              <button
                onClick={handleCreateNewBlog}
                className="ph-btn ph-btn--primary cursor-pointer"
                aria-label="Create a new blog"
              >
                <FontAwesomeIcon icon={faPlus} />
                New Blog
              </button>
            ) : undefined
          }
        />
      </div>

      {pinnedBlogs.length > 0 && searchTerm === "" && (
        <section className="pinned-blogs-section">
          <h2 className="blogs-header">
            <FontAwesomeIcon icon={faThumbtack} className="pinned-icon" />
            Pinned Blogs
          </h2>
          <div className="blogs-list">
            {pinnedBlogs.map((chap) => (
              <Chapter
                key={chap.id}
                id={chap.id}
                name={chap.name}
                desc={chap.desc}
                link={chap.link}
                tags={chap.tags}
                isABlog={true}
                slug={chap.slug}
              />
            ))}
          </div>
        </section>
      )}

      <main className="blogs-page">
        {searchTerm === "" ? (
          <h2 className="blogs-header">
            <FontAwesomeIcon icon={faList} /> All the blogs
          </h2>
        ) : (
          <h2 className="blogs-header">Search Results</h2>
        )}

        <div className="blogs-list">
          {finalChapters.map((chap, i) => (
            <Chapter
              key={i}
              id={chap.id}
              name={chap.name}
              desc={chap.desc}
              link={chap.link}
              tags={chap.tags}
              isABlog={true}
              slug={chap.slug}
            />
          ))}

          {finalChapters.length === 0 && searchTerm.length > 0 && (
            <p className="no-results">
              Nothing found for &quot;{searchTerm}&quot;.
            </p>
          )}
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <button
          onClick={handleCreateNewBlog}
          className="fab-new-blog"
          aria-label="Create a new blog"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      )}
    </div>
  );
}
