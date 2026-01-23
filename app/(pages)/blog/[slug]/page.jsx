import { blogsArray } from "../../../(core)/data/articles/index.js";
import { notFound } from "next/navigation";
import TheoryRenderer from "../../../(core)/components/theory/TheoryRenderer.tsx";
import Tag from "../../../(core)/components/Tag.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
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
  return { title: blog.name, description: blog.desc };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const blog = blogsArray.find((b) => b.slug === slug);

  if (!blog) notFound();

  const readingTime = blog.theory
    ? getReadingTime(JSON.stringify(blog.theory))
    : 1;

  // Ottiene i titoli includendo i sectionTitle interni
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
              <p className="blog-desc theory-paragraph">{blog.desc}</p>

              <div className="blog-meta-footer">
                <div className="author-info">
                  {blog.avatar ? (
                    <img
                      className="author-avatar"
                      src={blog.avatar}
                      alt="Author Avatar"
                    />
                  ) : blog.author ? (
                    <div className="author-avatar">{blog.author[0]}</div>
                  ) : (
                    <img
                      className="author-avatar"
                      src="../../Logo.png"
                      alt="PhysicsHub Logo"
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

            <div className="blog-content">
              {blog.theory && <TheoryRenderer theory={blog.theory} />}
            </div>
          </div>
        </main>

        {/* COLONNA DESTRA: Indice Sticky */}
        <aside className="blog-toc-sidebar">
          <div className="toc-container">
            <h4 className="toc-title">CONTENTS OF THIS ARTICLE</h4>
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
