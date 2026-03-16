// app/(pages)/blog/page.jsx
"use client";
import { useState } from "react";
import Chapter from "../../(core)/components/Chapter.jsx";
import Tag from "../../(core)/components/Tag.jsx";
import { blogsArray } from "../../(core)/data/articles/index.js";
import { Search } from "../../(core)/components/Search.jsx";
import { useRouter } from "next/navigation";
import useMobile from "../../(core)/hooks/useMobile.ts";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faList,
  faThumbtack,
  faPlus,
  faTableCells,
  faGrip,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

// ─── View modes ───────────────────────────────────────────────────────────────
const VIEW_MODES = [
  { id: "card", icon: faTableCells, label: "Card view" },
  { id: "list", icon: faBars, label: "List view" },
  { id: "compact", icon: faGrip, label: "Compact view" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getChapterTagNames = (tags) => tags.map((tag) => tag.name.toLowerCase());

// ─── ListRow – used only in list view ─────────────────────────────────────────
function ListRow({ chap }) {
  const router = useRouter();
  return (
    <article
      className="blog-list-row"
      onClick={() => router.push(`/blog/${chap.slug}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/blog/${chap.slug}`)}
    >
      <div className="blog-list-row__meta">
        <div className="blog-list-row__tags">
          {chap.tags.map((tag, i) => (
            <Tag key={tag.id || i} tag={tag} />
          ))}
        </div>
        <h3 className="blog-list-row__title">{chap.name}</h3>
        <p className="blog-list-row__desc">{chap.desc}</p>
      </div>
      <span className="blog-list-row__arrow">›</span>
    </article>
  );
}

// ─── CompactCard – used only in compact view ──────────────────────────────────
function CompactCard({ chap }) {
  const router = useRouter();
  return (
    <article
      className="blog-compact-card"
      onClick={() => router.push(`/blog/${chap.slug}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/blog/${chap.slug}`)}
    >
      <div className="blog-compact-card__tags">
        {chap.tags.map((tag, i) => (
          <Tag key={tag.id || i} tag={tag} />
        ))}
      </div>
      <h3 className="blog-compact-card__title">{chap.name}</h3>
      <p className="blog-compact-card__desc">{chap.desc}</p>
    </article>
  );
}

// ─── ViewToggle ────────────────────────────────────────────────────────────────
function ViewToggle({ current, onChange }) {
  return (
    <div className="blog-view-toggle" role="group" aria-label="View mode">
      {VIEW_MODES.map(({ id, icon, label }) => (
        <button
          key={id}
          className={`blog-view-btn${current === id ? " blog-view-btn--active" : ""}`}
          onClick={() => onChange(id)}
          aria-label={label}
          title={label}
        >
          <FontAwesomeIcon icon={icon} />
        </button>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("card"); // "card" | "list" | "compact"
  const router = useRouter();
  const isMobile = useMobile();

  const pinnedBlogs = blogsArray.filter((chap) => chap.isPinned);
  const unpinnedBlogs = blogsArray.filter((chap) => !chap.isPinned);

  const filteredUnpinnedChapters = unpinnedBlogs.filter((chap) => {
    const searchTerms = searchTerm
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 0);

    if (searchTerms.length === 0) return true;

    const chapterTagNames = getChapterTagNames(chap.tags);
    return searchTerms.every(
      (term) =>
        chap.name.toLowerCase().includes(term) || chapterTagNames.includes(term)
    );
  });

  const handleCreateNewBlog = () => router.push("/blog/create");

  // Grid class driven by view mode
  const gridClass =
    viewMode === "card"
      ? "blogs-list blogs-list--card"
      : viewMode === "list"
        ? "blogs-list blogs-list--list"
        : "blogs-list blogs-list--compact";

  const renderBlog = (chap, key) => {
    if (viewMode === "list") return <ListRow key={key} chap={chap} />;
    if (viewMode === "compact") return <CompactCard key={key} chap={chap} />;
    return (
      <Chapter
        key={key}
        id={chap.id}
        name={chap.name}
        desc={chap.desc}
        link={chap.link}
        tags={chap.tags}
        isABlog={true}
        slug={chap.slug}
      />
    );
  };

  return (
    <>
      {/* ── scoped styles ── */}
      <style>{`
        /* ── View toggle ────────────────────────────── */
        .blog-view-toggle {
          display: flex;
          align-items: center;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          overflow: hidden;
          flex-shrink: 0;
          background: color-mix(in oklab, var(--accent-color), transparent 92%);
        }
        .blog-view-btn {
          background: none;
          border: none;
          color: var(--text-color);
          padding: 0.5rem 0.7rem;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, opacity 0.2s;
          font-size: 0.9rem;
          line-height: 1;
          opacity: 0.5;
        }
        .blog-view-btn:hover {
          background: color-mix(in oklab, var(--accent-color), transparent 80%);
          opacity: 0.9;
        }
        .blog-view-btn--active {
          background: var(--accent-color);
          opacity: 1;
        }
        .blog-view-btn--active:hover {
          background: var(--accent-color);
          opacity: 1;
        }

        /* ── header row ─────────────────────────────── */
        .blog-header-row {
          display: flex;
          align-items: flex-end;
          gap: 0.75rem;
          width: 100%;
        }
        .blog-header-row > .search-wrapper { flex: 1; }

        /* ── CARD VIEW ──────────────────────────────── */
        .blogs-list--card {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        /* ── LIST VIEW ──────────────────────────────── */
        .blogs-list--list {
          display: flex;
          flex-direction: column;
          gap: 0;
          border-radius: var(--border-radius);
          overflow: hidden;
          border: 1px solid var(--border-color);
        }
        .blog-list-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1.2rem;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background 0.15s;
        }
        .blog-list-row:last-child { border-bottom: none; }
        .blog-list-row:hover {
          background: color-mix(in oklab, var(--accent-color), transparent 92%);
        }
        .blog-list-row__meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
        }
        .blog-list-row__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
          margin: 0.3rem 0;
        }
        .blog-list-row__title {
          font-size: 0.97rem;
          font-weight: 600;
          color: var(--text-color);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .blog-list-row__desc {
          font-size: 0.8rem;
          color: var(--subtitle-color, #9fb6c3);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .blog-list-row__arrow {
          color: var(--accent-color);
          font-size: 1.2rem;
          opacity: 0.4;
          flex-shrink: 0;
          transition: opacity 0.15s, transform 0.15s;
          line-height: 1;
        }
        .blog-list-row:hover .blog-list-row__arrow {
          opacity: 1;
          transform: translateX(3px);
        }

        /* ── COMPACT VIEW ───────────────────────────── */
        .blogs-list--compact {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 0.55rem;
        }
        .blog-compact-card {
          padding: 0.8rem 0.95rem;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          cursor: pointer;
          background: color-mix(in oklab, var(--accent-color), transparent 95%);
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
          display: flex;
          flex-direction: column;
          gap: 0.28rem;
        }
        .blog-compact-card:hover {
          border-color: var(--accent-color);
          box-shadow: 0 0 10px color-mix(in oklab, var(--accent-color), transparent 60%);
          transform: translateY(-2px);
        }
        .blog-compact-card__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
          margin: 0.3rem 0;
        }
        .blog-compact-card__title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-color);
          margin: 0;
          line-height: 1.3;
        }
        .blog-compact-card__desc {
          font-size: 0.73rem;
          color: var(--subtitle-color, #9fb6c3);
          margin: 0;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* ── shrink tags in dense views ─────────────── */
        .blogs-list--compact .tag,
        .blogs-list--list    .tag {
          font-size: 0.62rem;
          padding: 0.12rem 0.38rem;
          margin: 0;
        }

        /* ── entrance animation ─────────────────────── */
        .blogs-list > * {
          animation: fadeInUp 0.22s ease both;
        }
      `}</style>

      <div className="simulations-container blogs-container">
        {/* ── header ── */}
        <div className="header-controls">
          <div className="blog-header-row">
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
            <ViewToggle current={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* ── pinned section ── */}
        {pinnedBlogs.length > 0 && searchTerm === "" && (
          <section className="pinned-blogs-section">
            <h2 className="blogs-header">
              <FontAwesomeIcon icon={faThumbtack} className="pinned-icon" />
              Pinned Blogs
            </h2>
            <div className={gridClass}>
              {pinnedBlogs.map((chap, i) => renderBlog(chap, `pinned-${i}`))}
            </div>
          </section>
        )}

        {/* ── main list ── */}
        <main className="blogs-page">
          <h2 className="blogs-header">
            {searchTerm === "" ? (
              <>
                <FontAwesomeIcon icon={faList} /> All the blogs
              </>
            ) : (
              "Search Results"
            )}
          </h2>

          <div className={gridClass}>
            {filteredUnpinnedChapters.map((chap, i) => renderBlog(chap, i))}

            {filteredUnpinnedChapters.length === 0 && searchTerm.length > 0 && (
              <p className="no-results">
                Nothing found for &quot;{searchTerm}&quot;.
              </p>
            )}
          </div>
        </main>

        {/* ── FAB (mobile) ── */}
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
    </>
  );
}
