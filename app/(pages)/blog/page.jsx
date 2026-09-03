// app/(pages)/blog/page.jsx
"use client";
import { useMemo, useState } from "react";
import Chapter from "../../(core)/components/Chapter.jsx";
import Tag from "../../(core)/components/Tag.jsx";
import { blogsArray } from "../../(core)/data/articles/index.js";
import { Search } from "../../(core)/components/Search.jsx";
import {
  getBlogFacets,
  facetMatches,
  hasActiveFacets,
  sortCatalog,
  parseCatalogDate,
  DEFAULT_SORT,
} from "../../(core)/utils/catalogFilters.js";
import { useRouter } from "next/navigation";
import useMobile from "../../(core)/hooks/useMobile.ts";
import useTranslation from "../../(core)/hooks/useTranslation.ts";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faList,
  faThumbtack,
  faPlus,
  faTableCells,
  faGrip,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getChapterTagNames = (tags) => tags.map((tag) => tag.name.toLowerCase());

const emptyFilter = {
  text: "",
  tags: [],
  levels: [],
  difficulties: [],
  sort: DEFAULT_SORT,
};

const textMatches = (blog, text) => {
  const terms = text
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 0);
  if (terms.length === 0) return true;

  const tagNames = getChapterTagNames(blog.tags);
  return terms.every(
    (term) =>
      blog.name.toLowerCase().includes(term) ||
      (blog.desc || "").toLowerCase().includes(term) ||
      tagNames.includes(term)
  );
};

const BLOG_THUMBNAILS = {
  "what-is-physics":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Milky_Way_Night_Sky_Black_Rock_Desert_Nevada.jpg",
  "class-12-physics-complete-guide":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Single_slit_and_double_slit2.jpg",
  "physics-bouncing-ball-comprehensive-educational-guide":
    "https://www.fisicalab.com/sites/all/files/contenidos/en/kinematic/freefall.png",
  "comprehensive-guide-to-vector-operations":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Vector_addition.svg",
  "ball-uniformly-accelerated-motion":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Acceleration.svg",
  "ball-free-fall-comprehensive-guide":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Free_fall.svg",
  "spring-connection":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Simple_harmonic_motion_animation.gif",
  "physics-of-pendulum-explained":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Pendulum_animation.gif",
  "projectile-parabolic-motion":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Projectile_motion.svg",
  "physics-behind-three-body-problem":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Three-body_Problem_Animation_with_COM.gif",
  "pi-from-block-collisions-explained":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Galperin_billiards.svg/600px-Galperin_billiards.svg.png",
};

const getFirstBlogImage = (blog) => {
  if (blog.thumbnail) return blog.thumbnail;
  if (BLOG_THUMBNAILS[blog.slug]) return BLOG_THUMBNAILS[blog.slug];

  for (const section of blog.theory?.sections ?? []) {
    const imageBlock = section.blocks?.find(
      (block) => block.type === "image" && block.src
    );

    if (imageBlock?.src) return imageBlock.src;
  }

  return "";
};

// ─── ListRow – used only in list view ─────────────────────────────────────────
function ListRow({ chap, t }) {
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
        <h3 className="blog-list-row__title">{t(chap.name)}</h3>
        <p className="blog-list-row__desc">{t(chap.desc)}</p>
      </div>
      <span className="blog-list-row__arrow">›</span>
    </article>
  );
}

// ─── CompactCard – used only in compact view ──────────────────────────────────
function CompactCard({ chap, t }) {
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
      <h3 className="blog-compact-card__title">{t(chap.name)}</h3>
      <p className="blog-compact-card__desc">{t(chap.desc)}</p>
    </article>
  );
}

// ─── ViewToggle ────────────────────────────────────────────────────────────────
function ViewToggle({ current, onChange, t, viewModes }) {
  return (
    <div className="blog-view-toggle" role="group" aria-label={t("View mode")}>
      {viewModes.map(({ id, icon, label }) => (
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
  const { t, meta } = useTranslation();
  const isCompleted = meta?.completed || false;

  const VIEW_MODES = [
    { id: "card", icon: faTableCells, label: t("Card view") },
    { id: "list", icon: faBars, label: t("List view") },
    { id: "compact", icon: faGrip, label: t("Compact view") },
  ];

  const [filter, setFilter] = useState(emptyFilter);
  const [viewMode, setViewMode] = useState("card"); // "card" | "list" | "compact"
  const router = useRouter();
  const isMobile = useMobile();

  const pinnedBlogs = blogsArray.filter((chap) => chap.isPinned);
  const unpinnedBlogs = blogsArray.filter((chap) => !chap.isPinned);

  const isFiltering = hasActiveFacets(filter);

  const filteredUnpinned = useMemo(() => {
    const matched = unpinnedBlogs.filter(
      (blog) =>
        textMatches(blog, filter.text) &&
        facetMatches(getBlogFacets(blog), filter)
    );
    return sortCatalog(matched, filter.sort, {
      getFacets: getBlogFacets,
      getName: (blog) => blog.name,
      getRecency: (blog) => parseCatalogDate(blog.date),
    });
  }, [filter]);

  const handleCreateNewBlog = () => router.push("/blog/create");

  const gridClass =
    viewMode === "card"
      ? "blogs-list blogs-list--card"
      : viewMode === "list"
        ? "blogs-list blogs-list--list"
        : "blogs-list blogs-list--compact";

  const renderBlog = (chap, key) => {
    if (viewMode === "list") return <ListRow key={key} chap={chap} t={t} />;
    if (viewMode === "compact")
      return <CompactCard key={key} chap={chap} t={t} />;
    return (
      <Chapter
        key={key}
        id={chap.id}
        name={chap.name}
        desc={chap.desc}
        link={chap.link}
        thumbnail={getFirstBlogImage(chap)}
        tags={chap.tags}
        isABlog={true}
        slug={chap.slug}
      />
    );
  };

  return (
    <>
      <div
        className={`simulations-container blogs-container ${isCompleted ? "notranslate" : ""}`}
      >
        {/* ── header ── */}
        <div className="header-controls">
          <Search
            dataset={blogsArray}
            getFacets={getBlogFacets}
            onChange={setFilter}
            itemNoun="blogs"
            resultCount={filteredUnpinned.length}
            extraButton={
              <>
                <ViewToggle
                  current={viewMode}
                  onChange={setViewMode}
                  t={t}
                  viewModes={VIEW_MODES}
                />
                {!isMobile && (
                  <button
                    onClick={handleCreateNewBlog}
                    className="ph-btn ph-btn--primary cursor-pointer"
                    aria-label={t("Create a new blog")}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    {t("New Blog")}
                  </button>
                )}
              </>
            }
          />
        </div>

        {/* ── pinned section ── */}
        {pinnedBlogs.length > 0 && !isFiltering && (
          <section className="pinned-blogs-section">
            <h2 className="blogs-header">
              <FontAwesomeIcon icon={faThumbtack} className="pinned-icon" />
              {t("Pinned Blogs")}
            </h2>
            <div className={gridClass}>
              {pinnedBlogs.map((chap, i) => renderBlog(chap, `pinned-${i}`))}
            </div>
          </section>
        )}

        {/* ── main list ── */}
        <main className="blogs-page">
          <h2 className="blogs-header">
            {isFiltering ? (
              t("Search Results")
            ) : (
              <>
                <FontAwesomeIcon icon={faList} /> {t("All the blogs")}
              </>
            )}
          </h2>

          <div className={gridClass}>
            {filteredUnpinned.map((chap, i) => renderBlog(chap, i))}

            {filteredUnpinned.length === 0 && isFiltering && (
              <p className="no-results">{t("No blogs match these filters")}</p>
            )}
          </div>
        </main>

        {/* ── FAB (mobile) ── */}
        {isMobile && (
          <button
            onClick={handleCreateNewBlog}
            className="fab-new-blog"
            aria-label={t("Create a new blog")}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        )}
      </div>
    </>
  );
}
