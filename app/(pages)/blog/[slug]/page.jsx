import { blogsArray } from "../../../(core)/data/articles/index.js";
import { notFound } from "next/navigation";
import TheoryRenderer from "../../../(core)/components/theory/TheoryRenderer.tsx";
import Tag from "../../../(core)/components/Tag.jsx";
import BlogInteractions from "../../../(core)/components/blog/BlogInteractions.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faChevronRight,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import Image from "next/image";
import {
  getReadingTime,
  getTitles,
} from "../../../(core)/utils/blogHandling.ts";

export async function generateStaticParams() {
  return blogsArray.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = blogsArray.find((b) => b.slug === slug);
  if (!blog) return { title: "Blog Not Found" };

  return {
    title: blog.name,
    description: blog.desc,
    openGraph: {
      title: blog.name,
      description: blog.desc,
      type: "article",
      authors: [blog.author || "PhysicsHub"],
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const currentIndex = blogsArray.findIndex((b) => b.slug === slug);
  const blog = blogsArray[currentIndex];

  if (!blog) notFound();

  // Logic: Prev / Next / Related
  const prevPost = blogsArray[currentIndex - 1] || null;
  const nextPost = blogsArray[currentIndex + 1] || null;

  const relatedPosts = blogsArray
    .filter((b) => b.slug !== slug && b.tags.some((t) => blog.tags.includes(t)))
    .slice(0, 3);

  const readingTime = blog.theory
    ? getReadingTime(JSON.stringify(blog.theory))
    : 1;

  const tocItems = getTitles(blog);

  return (
    <div className="blog-page-wrapper">
      {/* --- BREADCRUMBS --- */}
      <nav className="breadcrumb-nav">
        <Link href="/">Home</Link>
        <FontAwesomeIcon icon={faChevronRight} className="breadcrumb-sep" />
        <Link href="/blog">Blog</Link>
        <FontAwesomeIcon icon={faChevronRight} className="breadcrumb-sep" />
        <span className="current-path">{blog.name}</span>
      </nav>

      <div className="blog-layout">
        {/* COLONNA SINISTRA: Contenuto */}
        <main className="blog-main-column">
          <div className="blog-container">
            <div className="blog-header">
              <div className="chapter-card-tags-container">
                {blog.tags.map((tag, idx) => (
                  <Tag tag={tag} key={tag.id || idx} />
                ))}
              </div>
              <h1 className="blog-title">{blog.name}</h1>
              <p className="blog-desc">{blog.desc}</p>

              <div className="blog-meta-footer">
                <div className="author-info">
                  {blog.avatar ? (
                    <Image
                      className="author-avatar"
                      src={blog.avatar}
                      alt="Author"
                      width={40}
                      height={40}
                    />
                  ) : blog.author ? (
                    <div className="author-avatar">{blog.author[0]}</div>
                  ) : (
                    <Image
                      className="author-avatar"
                      src="/Logo.png"
                      alt="Logo"
                      width={40}
                      height={40}
                    />
                  )}
                  <div className="author-details">
                    <span className="author-name">
                      {blog.author || "PhysicsHub Community"}
                    </span>
                    <span className="publish-date">
                      Last update: {blog.date || "--/--/----"}
                    </span>
                  </div>
                </div>
                <div className="reading-time-wrapper">
                  <div className="reading-time-content">
                    <span className="reading-time-label">Time to read</span>
                    <span className="reading-time-value">
                      <FontAwesomeIcon icon={faClock} /> {readingTime} min
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Componente Client Interattivo */}
            <BlogInteractions title={blog.name} slug={slug} />

            <div className="blog-content">
              {blog.theory && <TheoryRenderer theory={blog.theory} />}
            </div>

            {/* --- NAVIGAZIONE PREV / NEXT (Struttura CSS Pura) --- */}
            <div className="blog-navigation">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="blog-nav-link prev"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="nav-icon" />
                  <div className="nav-content">
                    <span className="nav-label">Previous Article</span>
                    <span className="nav-title">{prevPost.name}</span>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextPost && (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="blog-nav-link next"
                >
                  <div className="nav-content">
                    <span className="nav-label">Next Article</span>
                    <span className="nav-title">{nextPost.name}</span>
                  </div>
                  <FontAwesomeIcon icon={faArrowRight} className="nav-icon" />
                </Link>
              )}
            </div>

            {/* --- ARTICOLI CORRELATI (Struttura CSS Pura) --- */}
            {relatedPosts.length > 0 && (
              <div className="related-section">
                <h3 className="related-title">Related Articles</h3>
                <div className="related-grid">
                  {relatedPosts.map((post) => (
                    <Link
                      href={`/blog/${post.slug}`}
                      key={post.slug}
                      className="related-card"
                    >
                      <h4 className="related-card-title">{post.name}</h4>
                      <p className="related-card-desc">{post.desc}</p>
                      <span className="related-cta">
                        Read more <FontAwesomeIcon icon={faArrowRight} />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* COLONNA DESTRA: Indice Sticky */}
        <aside className="blog-toc-sidebar">
          <div className="toc-container">
            <h4 className="toc-title">Contents</h4>
            <ul className="toc-list">
              {tocItems.map((item) => (
                <li
                  key={item.id}
                  className={
                    item.isSubSection ? "toc-item-sub" : "toc-item-main"
                  }
                >
                  <a href={`#${item.id}`}>{item.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
